/**
 * 7Fish.org - Christian Faith Mystery Boxes JavaScript Framework
 * Main entry point for all JavaScript functionality
 */

class SevenFishApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize all components when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeComponents();
            this.bindEvents();
            this.setupAccessibility();
        });
    }

    initializeComponents() {
        // Initialize navigation
        if (typeof Navigation !== 'undefined') {
            this.navigation = new Navigation();
        }

        // Initialize search
        if (typeof Search !== 'undefined') {
            this.search = new Search();
        }

        // Initialize cart
        if (typeof Cart !== 'undefined') {
            this.cart = new Cart();
        }

        // Initialize modals
        if (typeof Modal !== 'undefined') {
            this.modal = new Modal();
        }

        // Initialize notifications
        if (typeof Notifications !== 'undefined') {
            this.notifications = new Notifications();
        }

        // Initialize product interactions
        this.initializeProductInteractions();

        // Initialize form validations
        this.initializeFormValidations();

        // Initialize infinite scroll
        this.initializeInfiniteScroll();
    }

    bindEvents() {
        // Global event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        // Window resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(this.handleResize.bind(this), 250);
        });

        // Online/offline events
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    setupAccessibility() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Focus trap for modals
        this.setupFocusTrap();
    }

    initializeProductInteractions() {
        // Product like buttons
        document.querySelectorAll('.product-like-btn').forEach(btn => {
            btn.addEventListener('click', this.handleProductLike.bind(this));
        });

        // Product share buttons
        document.querySelectorAll('.product-share-btn').forEach(btn => {
            btn.addEventListener('click', this.handleProductShare.bind(this));
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', this.handleAddToCart.bind(this));
        });

        // Product image galleries
        document.querySelectorAll('.product-gallery').forEach(gallery => {
            this.initializeProductGallery(gallery);
        });
    }

    initializeFormValidations() {
        // Contact forms
        document.querySelectorAll('form[data-validate]').forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Real-time validation
        document.querySelectorAll('input[data-validate], textarea[data-validate], select[data-validate]').forEach(field => {
            field.addEventListener('blur', this.handleFieldValidation.bind(this));
            field.addEventListener('input', this.handleFieldValidation.bind(this));
        });
    }

    initializeInfiniteScroll() {
        // Intersection Observer for infinite scroll
        const loadMoreTriggers = document.querySelectorAll('.load-more-trigger');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadMoreContent(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            loadMoreTriggers.forEach(trigger => {
                observer.observe(trigger);
            });
        }
    }

    handleGlobalClick(e) {
        // Close dropdowns when clicking outside
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }

        // Handle escape key for modals
        if (e.target.classList.contains('modal-backdrop') && e.target.classList.contains('active')) {
            e.target.classList.remove('active');
        }
    }

    handleKeydown(e) {
        // Close modals with Escape key
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-backdrop.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }

        // Handle tab navigation for accessibility
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }
    }

    handleResize() {
        // Update mobile menu state on resize
        const mobileMenu = document.querySelector('.navbar-nav.mobile');
        if (mobileMenu && window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
        }

        // Update product galleries
        document.querySelectorAll('.product-gallery').forEach(gallery => {
            this.updateGalleryLayout(gallery);
        });
    }

    handleOnline() {
        if (typeof Notifications !== 'undefined') {
            this.notifications.show('You are back online!', 'success');
        }
    }

    handleOffline() {
        if (typeof Notifications !== 'undefined') {
            this.notifications.show('You are offline. Some features may not work.', 'warning');
        }
    }

    handleProductLike(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const productId = btn.dataset.productId;

        btn.classList.toggle('liked');
        const isLiked = btn.classList.contains('liked');

        // Update button text/aria-label
        btn.setAttribute('aria-label', isLiked ? 'Remove from favorites' : 'Add to favorites');

        // Show notification
        if (typeof Notifications !== 'undefined') {
            this.notifications.show(
                isLiked ? 'Added to favorites!' : 'Removed from favorites',
                'success'
            );
        }

        // API call would go here
        if (typeof API !== 'undefined') {
            API.toggleFavorite(productId, isLiked);
        }
    }

    handleProductShare(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const productUrl = btn.dataset.shareUrl || window.location.href;

        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: productUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(productUrl).then(() => {
                if (typeof Notifications !== 'undefined') {
                    this.notifications.show('Link copied to clipboard!', 'success');
                }
            });
        }
    }

    handleAddToCart(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const productId = btn.dataset.productId;
        const quantity = parseInt(btn.dataset.quantity) || 1;

        if (typeof Cart !== 'undefined') {
            this.cart.addItem(productId, quantity);
        }

        // Visual feedback
        btn.textContent = 'Added!';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.disabled = false;
        }, 2000);
    }

    initializeProductGallery(gallery) {
        const images = gallery.querySelectorAll('img');
        const thumbnails = gallery.querySelectorAll('.gallery-thumbnail');
        const mainImage = gallery.querySelector('.gallery-main img');

        if (!mainImage) return;

        // Thumbnail click handlers
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                this.switchGalleryImage(gallery, index);
            });
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let currentIndex = 0;

        gallery.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        gallery.addEventListener('touchend', (e) => {
            if (!startX) return;

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) {
                if (diffX > 0 && currentIndex < images.length - 1) {
                    // Swipe left - next image
                    currentIndex++;
                    this.switchGalleryImage(gallery, currentIndex);
                } else if (diffX < 0 && currentIndex > 0) {
                    // Swipe right - previous image
                    currentIndex--;
                    this.switchGalleryImage(gallery, currentIndex);
                }
            }
        });
    }

    switchGalleryImage(gallery, index) {
        const images = gallery.querySelectorAll('img');
        const thumbnails = gallery.querySelectorAll('.gallery-thumbnail');
        const mainImage = gallery.querySelector('.gallery-main img');

        if (index >= 0 && index < images.length) {
            // Update main image
            if (mainImage && images[index]) {
                mainImage.src = images[index].src;
                mainImage.alt = images[index].alt;
            }

            // Update active thumbnail
            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
        }
    }

    updateGalleryLayout(gallery) {
        // Adjust gallery layout based on screen size
        const isMobile = window.innerWidth < 768;
        gallery.classList.toggle('mobile', isMobile);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;

        if (this.validateForm(form)) {
            const formData = new FormData(form);

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            // API call would go here
            if (typeof API !== 'undefined') {
                API.submitForm(form.action, formData)
                    .then(response => {
                        if (typeof Notifications !== 'undefined') {
                            this.notifications.show('Message sent successfully!', 'success');
                        }
                        form.reset();
                    })
                    .catch(error => {
                        if (typeof Notifications !== 'undefined') {
                            this.notifications.show('Error sending message. Please try again.', 'error');
                        }
                    })
                    .finally(() => {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Send Message';
                        }
                    });
            }
        }
    }

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[data-validate], textarea[data-validate], select[data-validate]');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    handleFieldValidation(e) {
        this.validateField(e.currentTarget);
    }

    validateField(field) {
        const value = field.value.trim();
        const rules = field.dataset.validate.split(',');
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Apply validation rules
        rules.forEach(rule => {
            switch (rule) {
                case 'required':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'This field is required';
                    }
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (value && !emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'min:3':
                    if (value.length < 3) {
                        isValid = false;
                        errorMessage = 'Minimum 3 characters required';
                    }
                    break;
                case 'numeric':
                    if (value && isNaN(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid number';
                    }
                    break;
            }
        });

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');

        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    loadMoreContent(trigger) {
        const container = trigger.closest('.load-more-container');
        if (!container || container.classList.contains('loading')) return;

        container.classList.add('loading');

        // Show loading indicator
        const loadingIndicator = container.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // API call to load more content
        if (typeof API !== 'undefined') {
            const nextPage = parseInt(container.dataset.page) || 1;
            const endpoint = container.dataset.endpoint;

            API.loadMore(endpoint, nextPage)
                .then(data => {
                    if (data.items && data.items.length > 0) {
                        this.appendContent(container, data.items);
                        container.dataset.page = nextPage + 1;

                        // Hide trigger if no more content
                        if (!data.hasMore) {
                            trigger.style.display = 'none';
                        }
                    } else {
                        trigger.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error loading more content:', error);
                    if (typeof Notifications !== 'undefined') {
                        this.notifications.show('Error loading content. Please try again.', 'error');
                    }
                })
                .finally(() => {
                    container.classList.remove('loading');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                });
        }
    }

    appendContent(container, items) {
        const template = container.dataset.template;
        const contentArea = container.querySelector('.content-area');

        if (template && contentArea) {
            items.forEach(item => {
                // This would use a templating system in a real app
                const element = this.createElementFromTemplate(template, item);
                if (element) {
                    contentArea.appendChild(element);
                }
            });
        }
    }

    createElementFromTemplate(template, data) {
        // Simple template replacement - in a real app, use a proper templating engine
        let html = template;
        Object.keys(data).forEach(key => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        return tempDiv.firstChild;
    }

    handleTabNavigation(e) {
        // Handle tab navigation for accessibility
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    setupFocusTrap() {
        // Focus trap for modals (would be enhanced per modal)
        document.querySelectorAll('.modal').forEach(modal => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length > 0) {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstElement) {
                                lastElement.focus();
                                e.preventDefault();
                            }
                        } else {
                            if (document.activeElement === lastElement) {
                                firstElement.focus();
                                e.preventDefault();
                            }
                        }
                    }
                });
            }
        });
    }
}

// Initialize the app
const app = new SevenFishApp();

// Export for potential use in other scripts
window.SevenFishApp = SevenFishApp;