/**
 * API Service - Handles all API communications with the backend
 */

class API {
    constructor() {
        this.baseURL = '/api'; // Change this to your actual API base URL
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        this.authToken = null;
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        // Set up online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
            if (typeof Notifications !== 'undefined') {
                this.notifications.info('You are back online');
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (typeof Notifications !== 'undefined') {
                this.notifications.warning('You are offline. Some features may not work.');
            }
        });

        // Load auth token from storage
        this.loadAuthToken();
    }

    // Authentication
    setAuthToken(token) {
        this.authToken = token;
        if (token) {
            Utils.storage.set('authToken', token);
        } else {
            Utils.storage.remove('authToken');
        }
    }

    loadAuthToken() {
        this.authToken = Utils.storage.get('authToken');
    }

    getAuthHeaders() {
        const headers = { ...this.defaultHeaders };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return headers;
    }

    // HTTP methods
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        // Add auth token to headers if available
        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);

            // Handle different response types
            if (!response.ok) {
                throw await this.handleError(response);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } catch (error) {
            // Queue request if offline
            if (!this.isOnline && options.queueOffline !== false) {
                return this.queueRequest(endpoint, config);
            }

            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.toString(), { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // File upload
    async uploadFile(endpoint, file, fieldName = 'file', additionalData = {}) {
        const formData = new FormData();
        formData.append(fieldName, file);

        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const headers = { ...this.getAuthHeaders() };
        delete headers['Content-Type']; // Let browser set multipart/form-data

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers
        });
    }

    // Error handling
    async handleError(response) {
        let errorMessage = 'An error occurred';
        let errorData = {};

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } else {
                errorMessage = await response.text();
            }
        } catch (e) {
            // If we can't parse the error response, use status text
            errorMessage = response.statusText || errorMessage;
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;

        // Handle specific error codes
        switch (response.status) {
            case 401:
                this.handleUnauthorized();
                break;
            case 403:
                this.handleForbidden();
                break;
            case 429:
                this.handleRateLimit(errorData);
                break;
            case 500:
                this.handleServerError();
                break;
        }

        return error;
    }

    handleUnauthorized() {
        // Clear auth token and redirect to login
        this.setAuthToken(null);
        if (typeof Notifications !== 'undefined') {
            this.notifications.warning('Your session has expired. Please log in again.');
        }
        // Redirect to login page after a delay
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }

    handleForbidden() {
        if (typeof Notifications !== 'undefined') {
            this.notifications.error('You don\'t have permission to perform this action.');
        }
    }

    handleRateLimit(data) {
        const retryAfter = data.retry_after || 60;
        if (typeof Notifications !== 'undefined') {
            this.notifications.warning(`Too many requests. Please wait ${retryAfter} seconds.`);
        }
    }

    handleServerError() {
        if (typeof Notifications !== 'undefined') {
            this.notifications.error('Server error. Please try again later.');
        }
    }

    // Request queue for offline handling
    queueRequest(endpoint, config) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                endpoint,
                config,
                resolve,
                reject,
                timestamp: Date.now()
            });

            if (typeof Notifications !== 'undefined') {
                this.notifications.info('Request queued. Will retry when online.');
            }
        });
    }

    async processQueue() {
        if (!this.isOnline || this.requestQueue.length === 0) return;

        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const item of queue) {
            try {
                // Check if request is not too old (e.g., 5 minutes)
                if (Date.now() - item.timestamp < 5 * 60 * 1000) {
                    const result = await this.request(item.endpoint, item.config);
                    item.resolve(result);
                } else {
                    item.reject(new Error('Request expired'));
                }
            } catch (error) {
                item.reject(error);
            }
        }
    }

    // Specific API endpoints
    async login(credentials) {
        try {
            const response = await this.post('/auth/login', credentials);
            if (response.token) {
                this.setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.setAuthToken(null);
            window.location.href = '/';
        }
    }

    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async updateProfile(userData) {
        return this.put('/auth/profile', userData);
    }

    // Products
    async getProducts(params = {}) {
        return this.get('/products', params);
    }

    async getProduct(id) {
        return this.get(`/products/${id}`);
    }

    async createProduct(productData) {
        return this.post('/products', productData);
    }

    async updateProduct(id, productData) {
        return this.put(`/products/${id}`, productData);
    }

    async deleteProduct(id) {
        return this.delete(`/products/${id}`);
    }

    // Search
    async search(query, filters = {}) {
        return this.get('/search', { q: query, ...filters });
    }

    async getSearchSuggestions(query) {
        return this.get('/search/suggestions', { q: query });
    }

    // Cart
    async getCart() {
        return this.get('/cart');
    }

    async addToCart(productId, quantity = 1, options = {}) {
        return this.post('/cart/items', { productId, quantity, ...options });
    }

    async updateCartItem(itemId, quantity) {
        return this.put(`/cart/items/${itemId}`, { quantity });
    }

    async removeCartItem(itemId) {
        return this.delete(`/cart/items/${itemId}`);
    }

    async clearCart() {
        return this.delete('/cart');
    }

    async applyCoupon(code) {
        return this.post('/cart/coupon', { code });
    }

    // Orders
    async createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    async getOrders(params = {}) {
        return this.get('/orders', params);
    }

    async getOrder(id) {
        return this.get(`/orders/${id}`);
    }

    // Favorites
    async getFavorites() {
        return this.get('/favorites');
    }

    async addToFavorites(productId) {
        return this.post('/favorites', { productId });
    }

    async removeFromFavorites(productId) {
        return this.delete(`/favorites/${productId}`);
    }

    async toggleFavorite(productId) {
        return this.post(`/favorites/toggle`, { productId });
    }

    // Reviews
    async getProductReviews(productId, params = {}) {
        return this.get(`/products/${productId}/reviews`, params);
    }

    async createReview(productId, reviewData) {
        return this.post(`/products/${productId}/reviews`, reviewData);
    }

    async updateReview(reviewId, reviewData) {
        return this.put(`/reviews/${reviewId}`, reviewData);
    }

    async deleteReview(reviewId) {
        return this.delete(`/reviews/${reviewId}`);
    }

    // Messages/Contact
    async sendMessage(messageData) {
        return this.post('/contact', messageData);
    }

    // File uploads
    async uploadProductImage(productId, file) {
        return this.uploadFile(`/products/${productId}/images`, file, 'image');
    }

    async uploadAvatar(file) {
        return this.uploadFile('/auth/avatar', file, 'avatar');
    }

    // Analytics/Tracking
    async trackEvent(eventName, eventData = {}) {
        // Fire and forget - don't wait for response
        this.post('/analytics/track', {
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        }).catch(() => {
            // Silently fail for analytics
        });
    }

    // Infinite scroll helper
    async loadMore(endpoint, page = 1, params = {}) {
        return this.get(endpoint, { page, ...params });
    }

    // Cache management
    cache = {
        data: new Map(),
        timestamps: new Map(),

        set: (key, data, ttl = 5 * 60 * 1000) => { // 5 minutes default TTL
            this.data.set(key, data);
            this.timestamps.set(key, Date.now() + ttl);
        },

        get: (key) => {
            if (this.timestamps.get(key) > Date.now()) {
                return this.data.get(key);
            } else {
                this.data.delete(key);
                this.timestamps.delete(key);
                return null;
            }
        },

        clear: () => {
            this.data.clear();
            this.timestamps.clear();
        }
    };

    // Retry mechanism
    async withRetry(fn, maxRetries = 3, delay = 1000) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Don't retry on 4xx errors (client errors)
                if (error.status >= 400 && error.status < 500) {
                    throw error;
                }

                // Wait before retrying
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }

        throw lastError;
    }

    // WebSocket connection (for real-time features)
    ws = null;
    wsReconnectAttempts = 0;
    maxReconnectAttempts = 5;

    connectWebSocket(url) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return this.ws;
        }

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.wsReconnectAttempts = 0;

                // Send authentication if we have a token
                if (this.authToken) {
                    this.ws.send(JSON.stringify({
                        type: 'auth',
                        token: this.authToken
                    }));
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.attemptReconnect(url);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            return this.ws;
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            return null;
        }
    }

    attemptReconnect(url) {
        if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max WebSocket reconnect attempts reached');
            return;
        }

        this.wsReconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts), 30000);

        setTimeout(() => {
            console.log(`Attempting WebSocket reconnect (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connectWebSocket(url);
        }, delay);
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'notification':
                if (typeof Notifications !== 'undefined') {
                    this.notifications.show(data.message, data.level || 'info');
                }
                break;

            case 'cart_updated':
                if (typeof Cart !== 'undefined') {
                    // Refresh cart data
                    this.getCart().then(cartData => {
                        // Update cart UI
                        console.log('Cart updated via WebSocket:', cartData);
                    });
                }
                break;

            case 'product_updated':
                // Handle product updates
                console.log('Product updated:', data.productId);
                break;

            default:
                // Dispatch custom event for other components to handle
                window.dispatchEvent(new CustomEvent('websocketMessage', { detail: data }));
        }
    }

    sendWebSocketMessage(type, data = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        }
    }
}

// Create global instance
window.API = new API();
