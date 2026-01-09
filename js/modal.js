/**
 * Modal Component - Handles modal dialogs, overlays, and accessibility
 */

class Modal {
    constructor() {
        this.activeModal = null;
        this.modals = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupModalTriggers();
    }

    bindEvents() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });

        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') && this.activeModal) {
                this.closeModal();
            }
        });

        // Handle tab navigation within modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.activeModal) {
                this.handleTabNavigation(e);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.activeModal) {
                this.centerModal();
            }
        });
    }

    setupModalTriggers() {
        // Find all modal triggers
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);

            if (modal) {
                this.modals.set(modalId, modal);

                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal(modalId);
                });
            }
        });

        // Close buttons within modals
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close')) {
                e.preventDefault();
                this.closeModal();
            }
        });
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId) || document.getElementById(modalId);
        if (!modal) return;

        // Close any currently open modal
        if (this.activeModal) {
            this.closeModal();
        }

        // Create or find backdrop
        let backdrop = modal.previousElementSibling;
        if (!backdrop || !backdrop.classList.contains('modal-backdrop')) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            modal.parentNode.insertBefore(backdrop, modal);
        }

        // Show modal
        this.activeModal = modal;
        modal.style.display = 'block';
        backdrop.classList.add('active');

        // Trigger opening animation
        setTimeout(() => {
            modal.classList.add('active');
            backdrop.classList.add('active');
        }, 10);

        // Focus management
        this.focusModal();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Dispatch custom event
        const event = new CustomEvent('modalOpened', { detail: { modalId, modal } });
        document.dispatchEvent(event);
    }

    closeModal() {
        if (!this.activeModal) return;

        const modal = this.activeModal;
        const backdrop = modal.previousElementSibling;

        // Remove active classes
        modal.classList.remove('active');
        if (backdrop) {
            backdrop.classList.remove('active');
        }

        // Hide modal after animation
        setTimeout(() => {
            modal.style.display = 'none';
            if (backdrop) {
                backdrop.style.display = 'none';
            }
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to trigger
        this.returnFocus();

        // Clear active modal
        this.activeModal = null;

        // Dispatch custom event
        const event = new CustomEvent('modalClosed', { detail: { modal } });
        document.dispatchEvent(event);
    }

    focusModal() {
        if (!this.activeModal) return;

        // Find the first focusable element
        const focusableElements = this.getFocusableElements(this.activeModal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            // Fallback to modal itself
            this.activeModal.focus();
        }
    }

    returnFocus() {
        // Try to return focus to the element that opened the modal
        const trigger = document.querySelector(`[data-modal="${this.activeModal.id}"]`);
        if (trigger) {
            trigger.focus();
        }
    }

    handleTabNavigation(e) {
        if (!this.activeModal) return;

        const focusableElements = this.getFocusableElements(this.activeModal);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    getFocusableElements(container) {
        const focusableSelectors = [
            'a[href]',
            'area[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(container.querySelectorAll(focusableSelectors.join(',')))
            .filter(element => {
                // Check if element is visible
                const style = window.getComputedStyle(element);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
    }

    centerModal() {
        if (!this.activeModal) return;

        // Reset any centering styles
        this.activeModal.style.top = '';
        this.activeModal.style.left = '';
        this.activeModal.style.transform = '';
    }

    // Utility method to create and show a modal programmatically
    show(content, options = {}) {
        const modalId = 'dynamic-modal-' + Date.now();

        // Create modal HTML
        const modalHTML = `
            <div class="modal-backdrop">
                <div id="${modalId}" class="modal" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
                    <div class="modal-header">
                        <h3 id="${modalId}-title" class="modal-title">${options.title || 'Modal'}</h3>
                        <button class="modal-close" aria-label="Close modal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            </div>
        `;

        // Insert into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById(modalId);
        const backdrop = modal.parentElement;

        // Store reference
        this.modals.set(modalId, modal);

        // Open modal
        this.openModal(modalId);

        // Setup footer buttons if provided
        if (options.footer) {
            const footer = modal.querySelector('.modal-footer');
            footer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn')) {
                    const action = e.target.dataset.action;
                    if (options.onAction) {
                        options.onAction(action, this);
                    }
                }
            });
        }

        // Auto-remove modal when closed
        const closeHandler = () => {
            setTimeout(() => {
                if (backdrop && backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
                this.modals.delete(modalId);
            }, 300);

            document.removeEventListener('modalClosed', closeHandler);
        };

        document.addEventListener('modalClosed', closeHandler);

        return modalId;
    }

    // Confirmation modal
    confirm(message, options = {}) {
        const content = `<p>${message}</p>`;

        const footer = `
            <button class="btn btn-ghost" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">${options.confirmText || 'Confirm'}</button>
        `;

        return new Promise((resolve) => {
            this.show(content, {
                title: options.title || 'Confirm',
                footer: footer,
                onAction: (action, modal) => {
                    modal.closeModal();
                    resolve(action === 'confirm');
                }
            });
        });
    }

    // Alert modal
    alert(message, options = {}) {
        const content = `<p>${message}</p>`;

        const footer = `<button class="btn btn-primary" data-action="ok">${options.okText || 'OK'}</button>`;

        return new Promise((resolve) => {
            this.show(content, {
                title: options.title || 'Alert',
                footer: footer,
                onAction: (action, modal) => {
                    modal.closeModal();
                    resolve();
                }
            });
        });
    }

    // Image gallery modal
    showImageGallery(images, startIndex = 0) {
        if (!images || images.length === 0) return;

        let currentIndex = startIndex;

        const createGalleryContent = () => `
            <div class="image-gallery">
                <div class="gallery-main">
                    <img src="${images[currentIndex].src}" alt="${images[currentIndex].alt || ''}" class="gallery-image">
                    <div class="gallery-nav">
                        <button class="gallery-prev" ${currentIndex === 0 ? 'disabled' : ''} aria-label="Previous image">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <button class="gallery-next" ${currentIndex === images.length - 1 ? 'disabled' : ''} aria-label="Next image">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="gallery-thumbnails">
                    ${images.map((image, index) => `
                        <button class="gallery-thumb ${index === currentIndex ? 'active' : ''}"
                                data-index="${index}"
                                aria-label="View image ${index + 1}">
                            <img src="${image.src}" alt="${image.alt || ''}">
                        </button>
                    `).join('')}
                </div>
                <div class="gallery-counter">${currentIndex + 1} of ${images.length}</div>
            </div>
        `;

        const modalId = this.show(createGalleryContent(), {
            title: 'Image Gallery',
            footer: ''
        });

        const modal = document.getElementById(modalId);

        const updateGallery = () => {
            const content = modal.querySelector('.modal-body');
            content.innerHTML = createGalleryContent();
            bindGalleryEvents();
        };

        const bindGalleryEvents = () => {
            const prevBtn = modal.querySelector('.gallery-prev');
            const nextBtn = modal.querySelector('.gallery-next');
            const thumbs = modal.querySelectorAll('.gallery-thumb');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateGallery();
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentIndex < images.length - 1) {
                        currentIndex++;
                        updateGallery();
                    }
                });
            }

            thumbs.forEach((thumb, index) => {
                thumb.addEventListener('click', () => {
                    currentIndex = index;
                    updateGallery();
                });
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    currentIndex--;
                    updateGallery();
                } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                    currentIndex++;
                    updateGallery();
                }
            });
        };

        // Bind initial events
        setTimeout(bindGalleryEvents, 100);
    }

    // Form modal
    showForm(formContent, options = {}) {
        const content = `
            <form class="modal-form" ${options.method ? `method="${options.method}"` : ''} ${options.action ? `action="${options.action}"` : ''}>
                ${formContent}
            </form>
        `;

        const footer = `
            <button class="btn btn-ghost" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="submit" type="submit">${options.submitText || 'Submit'}</button>
        `;

        return new Promise((resolve, reject) => {
            const modalId = this.show(content, {
                title: options.title || 'Form',
                footer: footer,
                onAction: (action, modal) => {
                    if (action === 'submit') {
                        const form = modal.activeModal.querySelector('.modal-form');
                        if (form) {
                            const formData = new FormData(form);

                            // Basic form validation
                            if (options.validate) {
                                const errors = options.validate(formData);
                                if (errors && errors.length > 0) {
                                    // Show validation errors
                                    this.showValidationErrors(form, errors);
                                    return;
                                }
                            }

                            modal.closeModal();
                            resolve(formData);
                        }
                    } else {
                        modal.closeModal();
                        resolve(null);
                    }
                }
            });

            // Handle form submission
            setTimeout(() => {
                const form = document.getElementById(modalId).querySelector('.modal-form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        // Trigger submit action
                        const submitBtn = document.querySelector(`#${modalId} .modal-footer .btn[data-action="submit"]`);
                        if (submitBtn) {
                            submitBtn.click();
                        }
                    });
                }
            }, 100);
        });
    }

    showValidationErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.field-error').forEach(error => error.remove());

        // Show new errors
        errors.forEach(error => {
            const field = form.querySelector(`[name="${error.field}"]`);
            if (field) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = error.message;
                field.parentNode.appendChild(errorDiv);
                field.classList.add('error');
            }
        });

        // Focus first error field
        const firstErrorField = form.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }

    // Loading modal
    showLoading(message = 'Loading...') {
        const content = `
            <div class="loading-modal">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        const modalId = this.show(content, {
            title: '',
            footer: ''
        });

        // Disable close buttons for loading modal
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.style.display = 'none';
        }

        return {
            close: () => this.closeModal(),
            updateMessage: (newMessage) => {
                const messageEl = modal.querySelector('p');
                if (messageEl) {
                    messageEl.textContent = newMessage;
                }
            }
        };
    }
}

// Export for use in main.js
window.Modal = Modal;