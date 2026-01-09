/**
 * Shopping Cart Component - Handles cart functionality, persistence, and UI updates
 */

class Cart {
    constructor() {
        this.items = [];
        this.cartKey = 'sevenfish_cart';
        this.init();
    }

    init() {
        this.loadCart();
        this.bindEvents();
        this.updateCartUI();
    }

    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.add-to-cart-btn');
                const productId = btn.dataset.productId;
                const quantity = parseInt(btn.dataset.quantity) || 1;
                this.addItem(productId, quantity);
            }
        });

        // Cart dropdown toggle
        const cartToggle = document.querySelector('.cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCartDropdown();
            });
        }

        // Close cart dropdown on outside click
        document.addEventListener('click', (e) => {
            const cartDropdown = document.querySelector('.cart-dropdown');
            const cartToggle = document.querySelector('.cart-toggle');

            if (cartDropdown && cartToggle &&
                !cartDropdown.contains(e.target) &&
                !cartToggle.contains(e.target)) {
                this.closeCartDropdown();
            }
        });

        // Cart page specific events
        this.bindCartPageEvents();
    }

    bindCartPageEvents() {
        // Quantity update buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantity-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.quantity-btn');
                const itemId = btn.dataset.itemId;
                const action = btn.dataset.action;

                if (action === 'increase') {
                    this.updateQuantity(itemId, 1);
                } else if (action === 'decrease') {
                    this.updateQuantity(itemId, -1);
                }
            }
        });

        // Remove item buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.remove-item-btn');
                const itemId = btn.dataset.itemId;
                this.removeItem(itemId);
            }
        });

        // Quantity input changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const itemId = e.target.dataset.itemId;
                const newQuantity = parseInt(e.target.value);

                if (newQuantity > 0) {
                    this.setQuantity(itemId, newQuantity);
                } else {
                    e.target.value = this.getItemQuantity(itemId);
                }
            }
        });

        // Apply coupon button
        const applyCouponBtn = document.querySelector('.apply-coupon-btn');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyCoupon();
            });
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.proceedToCheckout();
            });
        }
    }

    addItem(productId, quantity = 1) {
        const existingItem = this.items.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // Mock product data - in real app, this would come from API
            const product = this.getProductData(productId);
            if (product) {
                this.items.push({
                    id: productId,
                    ...product,
                    quantity: quantity
                });
            }
        }

        this.saveCart();
        this.updateCartUI();

        // Show notification
        if (typeof Notifications !== 'undefined') {
            this.notifications.show(`✝️ Added ${quantity} faith item${quantity > 1 ? 's' : ''} to cart!`, 'success');
        }

        // Animate cart icon
        this.animateCartIcon();
    }

    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                this.removeItem(productId);
                return;
            }

            this.saveCart();
            this.updateCartUI();
        }
    }

    setQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item && quantity > 0) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();

        // Show notification
        if (typeof Notifications !== 'undefined') {
            this.notifications.show('Faith item removed from cart', 'info');
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }

    saveCart() {
        try {
            localStorage.setItem(this.cartKey, JSON.stringify(this.items));
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    }

    loadCart() {
        try {
            const saved = localStorage.getItem(this.cartKey);
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load cart:', e);
            this.items = [];
        }
    }

    updateCartUI() {
        this.updateCartIcon();
        this.updateCartDropdown();
        this.updateCartPage();
    }

    updateCartIcon() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        }

        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) {
            cartTotal.textContent = `$${this.getTotalPrice().toFixed(2)}`;
        }
    }

    updateCartDropdown() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (!dropdown) return;

        const itemsList = dropdown.querySelector('.cart-items');
        const emptyMessage = dropdown.querySelector('.cart-empty');
        const footer = dropdown.querySelector('.cart-footer');

        if (this.items.length === 0) {
            if (itemsList) itemsList.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (footer) footer.style.display = 'none';
            return;
        }

        if (itemsList) {
            itemsList.innerHTML = this.items.slice(0, 3).map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
                        <button class="remove-item-btn" data-item-id="${item.id}" aria-label="Remove item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

            if (this.items.length > 3) {
                itemsList.innerHTML += `<div class="cart-more">And ${this.items.length - 3} more items...</div>`;
            }

            itemsList.style.display = 'block';
        }

        if (emptyMessage) emptyMessage.style.display = 'none';
        if (footer) footer.style.display = 'block';

        // Update footer total
        const footerTotal = footer.querySelector('.cart-footer-total');
        if (footerTotal) {
            footerTotal.textContent = `Total: $${this.getTotalPrice().toFixed(2)}`;
        }
    }

    updateCartPage() {
        const cartPage = document.querySelector('.cart-page');
        if (!cartPage) return;

        const cartItems = cartPage.querySelector('.cart-items');
        const cartSummary = cartPage.querySelector('.cart-summary');
        const emptyCart = cartPage.querySelector('.empty-cart');

        if (this.items.length === 0) {
            if (cartItems) cartItems.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item-row" data-item-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.title}</h3>
                        <div class="cart-item-seller">by ${item.seller}</div>
                        <div class="cart-item-price">$${item.price}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-item-id="${item.id}" data-action="decrease" aria-label="Decrease quantity">-</button>
                        <input type="number" class="quantity-input" data-item-id="${item.id}" value="${item.quantity}" min="1" aria-label="Quantity">
                        <button class="quantity-btn" data-item-id="${item.id}" data-action="increase" aria-label="Increase quantity">+</button>
                    </div>
                    <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <button class="remove-item-btn" data-item-id="${item.id}" aria-label="Remove item">Remove</button>
                    </div>
                </div>
            `).join('');

            cartItems.style.display = 'block';
        }

        if (cartSummary) {
            this.updateCartSummary(cartSummary);
            cartSummary.style.display = 'block';
        }

        if (emptyCart) emptyCart.style.display = 'none';
    }

    updateCartSummary(summary) {
        const subtotal = this.getTotalPrice();
        const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        summary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary checkout-btn">Proceed to Checkout</button>
            <div class="coupon-section">
                <input type="text" class="coupon-input" placeholder="Enter coupon code">
                <button class="btn btn-outline apply-coupon-btn">Apply</button>
            </div>
        `;
    }

    toggleCartDropdown() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (dropdown) {
            const isOpen = dropdown.classList.contains('active');
            if (isOpen) {
                this.closeCartDropdown();
            } else {
                this.openCartDropdown();
            }
        }
    }

    openCartDropdown() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (dropdown) {
            // Close other dropdowns
            document.querySelectorAll('.dropdown.active').forEach(d => {
                if (!d.classList.contains('cart-dropdown')) {
                    d.classList.remove('active');
                }
            });

            dropdown.classList.add('active');
        }
    }

    closeCartDropdown() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-toggle');
        if (cartIcon) {
            cartIcon.classList.add('bounce');
            setTimeout(() => {
                cartIcon.classList.remove('bounce');
            }, 600);
        }
    }

    applyCoupon() {
        const couponInput = document.querySelector('.coupon-input');
        if (!couponInput) return;

        const couponCode = couponInput.value.trim().toUpperCase();
        if (!couponCode) return;

        // Mock coupon validation
        const validCoupons = {
            'SAVE10': 0.1,  // 10% off
            'FREESHIP': 'shipping',  // Free shipping
            'WELCOME': 0.05  // 5% off
        };

        if (validCoupons[couponCode]) {
            const discount = validCoupons[couponCode];

            if (typeof Notifications !== 'undefined') {
                if (discount === 'shipping') {
                    this.notifications.show('Free shipping coupon applied!', 'success');
                } else {
                    this.notifications.show(`${(discount * 100).toFixed(0)}% discount applied!`, 'success');
                }
            }

            couponInput.value = '';
            this.updateCartPage(); // Refresh summary with discount
        } else {
            if (typeof Notifications !== 'undefined') {
                this.notifications.show('Invalid coupon code', 'error');
            }
        }
    }

    proceedToCheckout() {
        if (this.items.length === 0) {
            if (typeof Notifications !== 'undefined') {
                this.notifications.show('Your cart is empty', 'warning');
            }
            return;
        }

        // In a real app, this would redirect to checkout page
        window.location.href = '/checkout';
    }

    getProductData(productId) {
        // Mock product data - in real app, this would be an API call
        const mockProducts = {
            '1': {
                title: 'Handmade Leather Crossbody Bag',
                price: 89.99,
                image: 'https://via.placeholder.com/280x240/FFE4E1/FF6B6B?text=Handmade+Bag',
                seller: 'ArtisanLeather'
            },
            '2': {
                title: 'Ceramic Vase with Blue Glaze',
                price: 45.00,
                image: 'https://via.placeholder.com/280x240/E8F4F8/74B9FF?text=Ceramic+Vase',
                seller: 'PotteryArt'
            },
            '3': {
                title: 'Merino Wool Throw Blanket',
                price: 120.00,
                image: 'https://via.placeholder.com/280x240/F0F8E7/6FAF5A?text=Wool+Blanket',
                seller: 'WoolWorks'
            },
            '4': {
                title: 'Live Edge Wooden Salad Bowl',
                price: 65.00,
                image: 'https://via.placeholder.com/280x240/FFF2E8/FF8C42?text=Wooden+Bowl',
                seller: 'WoodCraft'
            }
        };

        return mockProducts[productId] || null;
    }

    // Export cart data for checkout
    getCartData() {
        return {
            items: this.items,
            subtotal: this.getTotalPrice(),
            itemCount: this.getItemCount(),
            timestamp: new Date().toISOString()
        };
    }

    // Validate cart before checkout
    validateCart() {
        const errors = [];

        if (this.items.length === 0) {
            errors.push('Your cart is empty');
        }

        // Check for out of stock items (mock)
        this.items.forEach(item => {
            if (item.quantity > 10) { // Mock stock limit
                errors.push(`${item.title} is limited to 10 per customer`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Export for use in main.js
window.Cart = Cart;