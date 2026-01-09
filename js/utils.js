/**
 * Utility Functions - Common helper functions used across the application
 */

class Utils {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
    }

    // Debounce function calls
    debounce(func, wait, immediate = false) {
        const key = func.toString() + wait;

        return (...args) => {
            const callNow = immediate && !this.debounceTimers.has(key);

            clearTimeout(this.debounceTimers.get(key));

            this.debounceTimers.set(key, setTimeout(() => {
                this.debounceTimers.delete(key);
                if (!immediate) func.apply(this, args);
            }, wait));

            if (callNow) func.apply(this, args);
        };
    }

    // Throttle function calls
    throttle(func, limit) {
        const key = func.toString() + limit;

        return (...args) => {
            if (!this.throttleTimers.has(key)) {
                func.apply(this, args);
                this.throttleTimers.set(key, true);
                setTimeout(() => {
                    this.throttleTimers.delete(key);
                }, limit);
            }
        };
    }

    // Format currency
    formatCurrency(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
    }

    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return count === 1
                    ? `1 ${interval.label} ago`
                    : `${count} ${interval.label}s ago`;
            }
        }

        return 'Just now';
    }

    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Convert to title case
    titleCase(str) {
        return str.toLowerCase().split(' ').map(word => this.capitalize(word)).join(' ');
    }

    // Generate random ID
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Generate UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));

        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key]);
        });
        return cloned;
    }

    // Check if object is empty
    isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    }

    // Get URL parameters
    getURLParams(url = window.location.href) {
        const params = {};
        const urlObj = new URL(url);
        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    // Set URL parameters
    setURLParams(params, url = window.location.href) {
        const urlObj = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                urlObj.searchParams.delete(key);
            } else {
                urlObj.searchParams.set(key, params[key]);
            }
        });
        return urlObj.toString();
    }

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackErr) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    // Download file
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Check if element is in viewport
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= windowHeight + threshold &&
            rect.right <= windowWidth + threshold
        );
    }

    // Scroll to element
    scrollToElement(element, offset = 0, behavior = 'smooth') {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: behavior
        });
    }

    // Get element dimensions
    getElementDimensions(element) {
        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right
        };
    }

    // Add CSS class temporarily
    addTemporaryClass(element, className, duration = 1000) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }

    // Animate element
    animateElement(element, keyframes, options = {}) {
        const defaultOptions = {
            duration: 300,
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        return element.animate(keyframes, { ...defaultOptions, ...options });
    }

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number (basic)
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Sanitize HTML
    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }

    // Escape HTML
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Parse JSON safely
    parseJSON(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn('Failed to parse JSON:', e);
            return fallback;
        }
    }

    // Stringify JSON safely
    stringifyJSON(obj, fallback = '{}') {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            console.warn('Failed to stringify JSON:', e);
            return fallback;
        }
    }

    // Local storage helpers
    storage = {
        set: (key, value) => {
            try {
                localStorage.setItem(key, this.stringifyJSON(value));
                return true;
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
                return false;
            }
        },

        get: (key, fallback = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? this.parseJSON(item, fallback) : fallback;
            } catch (e) {
                console.warn('Failed to read from localStorage:', e);
                return fallback;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Failed to remove from localStorage:', e);
                return false;
            }
        },

        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.warn('Failed to clear localStorage:', e);
                return false;
            }
        }
    };

    // Cookie helpers
    cookies = {
        set: (name, value, days = 7, path = '/') => {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${path}`;
        },

        get: (name) => {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        remove: (name, path = '/') => {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
        }
    };

    // Device detection
    device = {
        isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: () => /iPad|Android(?=.*\bMobile\b)(?!.*\bPhone\b)/i.test(navigator.userAgent),
        isDesktop: () => !this.device.isMobile() && !this.device.isTablet(),
        isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: () => /Android/i.test(navigator.userAgent)
    };

    // Browser detection
    browser = {
        isChrome: () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isFirefox: () => /Firefox/.test(navigator.userAgent),
        isSafari: () => /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
        isEdge: () => /Edge/.test(navigator.userAgent),
        isIE: () => /MSIE|Trident/.test(navigator.userAgent)
    };

    // Performance helpers
    performance = {
        mark: (name) => {
            if ('performance' in window && performance.mark) {
                performance.mark(name);
            }
        },

        measure: (name, startMark, endMark) => {
            if ('performance' in window && performance.measure) {
                try {
                    performance.measure(name, startMark, endMark);
                    const measure = performance.getEntriesByName(name)[0];
                    return measure.duration;
                } catch (e) {
                    console.warn('Performance measure failed:', e);
                    return null;
                }
            }
            return null;
        },

        now: () => {
            return 'performance' in window ? performance.now() : Date.now();
        }
    };

    // Event helpers
    events = {
        add: (element, event, handler, options = {}) => {
            if (element.addEventListener) {
                element.addEventListener(event, handler, options);
            } else if (element.attachEvent) {
                element.attachEvent(`on${event}`, handler);
            }
        },

        remove: (element, event, handler, options = {}) => {
            if (element.removeEventListener) {
                element.removeEventListener(event, handler, options);
            } else if (element.detachEvent) {
                element.detachEvent(`on${event}`, handler);
            }
        },

        trigger: (element, event, data = {}) => {
            const customEvent = new CustomEvent(event, { detail: data });
            element.dispatchEvent(customEvent);
        }
    };
}

// Create global instance
window.Utils = new Utils();