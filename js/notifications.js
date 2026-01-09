/**
 * Notifications Component - Handles toast messages, alerts, and user feedback
 */

class Notifications {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.createContainer();
        this.bindEvents();
    }

    createContainer() {
        // Create notification container if it doesn't exist
        this.container = document.querySelector('.notifications-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notifications-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(this.container);
        }
    }

    bindEvents() {
        // Handle notification close buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.notification-close')) {
                e.preventDefault();
                const notification = e.target.closest('.notification');
                if (notification) {
                    this.remove(notification.dataset.id);
                }
            }
        });

        // Auto-remove notifications after timeout
        setInterval(() => {
            this.cleanupExpired();
        }, 1000);
    }

    show(message, type = 'info', options = {}) {
        const notification = {
            id: this.generateId(),
            message: message,
            type: type,
            timestamp: Date.now(),
            duration: options.duration || this.getDefaultDuration(type),
            persistent: options.persistent || false,
            action: options.action || null
        };

        this.notifications.push(notification);
        this.render(notification);

        // Auto-remove if not persistent
        if (!notification.persistent) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        return notification.id;
    }

    render(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.dataset.id = notification.id;
        notificationEl.setAttribute('role', 'alert');
        notificationEl.setAttribute('aria-live', 'assertive');

        const icon = this.getIcon(notification.type);

        notificationEl.innerHTML = `
            <div class="notification-content">
                ${icon ? `<div class="notification-icon">${icon}</div>` : ''}
                <div class="notification-message">${notification.message}</div>
                ${notification.action ? `<div class="notification-action">${notification.action}</div>` : ''}
            </div>
            <button class="notification-close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            ${!notification.persistent ? `<div class="notification-progress" style="animation-duration: ${notification.duration}ms"></div>` : ''}
        `;

        // Add to container
        this.container.appendChild(notificationEl);

        // Animate in
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 10);

        // Handle action clicks
        if (notification.action) {
            const actionEl = notificationEl.querySelector('.notification-action');
            if (actionEl) {
                actionEl.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                        this.remove(notification.id);
                    }
                });
            }
        }

        return notificationEl;
    }

    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const notificationEl = this.container.querySelector(`[data-id="${id}"]`);
        if (notificationEl) {
            // Animate out
            notificationEl.classList.remove('show');
            notificationEl.classList.add('hide');

            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.parentNode.removeChild(notificationEl);
                }
            }, 300);
        }

        // Remove from array
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    clear() {
        // Remove all notifications
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    }

    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };

        return icons[type] || icons.info;
    }

    getDefaultDuration(type) {
        const durations = {
            success: 3000,
            error: 5000,
            warning: 4000,
            info: 3000
        };

        return durations[type] || 3000;
    }

    generateId() {
        return 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    cleanupExpired() {
        const now = Date.now();
        this.notifications.forEach(notification => {
            if (!notification.persistent && now - notification.timestamp >= notification.duration) {
                this.remove(notification.id);
            }
        });
    }

    // Specific notification types
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Action notifications
    confirm(message, options = {}) {
        const action = `
            <button class="btn btn-sm btn-ghost">Cancel</button>
            <button class="btn btn-sm btn-primary">${options.confirmText || 'Confirm'}</button>
        `;

        return new Promise((resolve) => {
            const notificationId = this.show(message, 'info', {
                ...options,
                persistent: true,
                action: action
            });

            // Wait for action clicks
            const notificationEl = this.container.querySelector(`[data-id="${notificationId}"]`);
            if (notificationEl) {
                const actionEl = notificationEl.querySelector('.notification-action');
                if (actionEl) {
                    actionEl.addEventListener('click', (e) => {
                        if (e.target.classList.contains('btn-primary')) {
                            this.remove(notificationId);
                            resolve(true);
                        } else if (e.target.classList.contains('btn-ghost')) {
                            this.remove(notificationId);
                            resolve(false);
                        }
                    });
                }
            }
        });
    }

    // Loading notification
    loading(message = 'Loading...', options = {}) {
        const notificationId = this.show(message, 'info', {
            ...options,
            persistent: true
        });

        return {
            update: (newMessage) => {
                const notificationEl = this.container.querySelector(`[data-id="${notificationId}"]`);
                if (notificationEl) {
                    const messageEl = notificationEl.querySelector('.notification-message');
                    if (messageEl) {
                        messageEl.textContent = newMessage;
                    }
                }
            },
            close: () => this.remove(notificationId)
        };
    }

    // Progress notification
    progress(message, progress = 0, options = {}) {
        const notificationId = this.show(message, 'info', {
            ...options,
            persistent: true
        });

        this.updateProgress(notificationId, progress);

        return {
            update: (newProgress, newMessage) => {
                if (newMessage) {
                    const notificationEl = this.container.querySelector(`[data-id="${notificationId}"]`);
                    if (notificationEl) {
                        const messageEl = notificationEl.querySelector('.notification-message');
                        if (messageEl) {
                            messageEl.textContent = newMessage;
                        }
                    }
                }
                this.updateProgress(notificationId, newProgress);
            },
            close: () => this.remove(notificationId)
        };
    }

    updateProgress(notificationId, progress) {
        const notificationEl = this.container.querySelector(`[data-id="${notificationId}"]`);
        if (notificationEl) {
            let progressBar = notificationEl.querySelector('.notification-progress-custom');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'notification-progress-custom';
                notificationEl.appendChild(progressBar);
            }

            progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';

            // Update progress text if it exists
            const progressText = notificationEl.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = Math.round(progress) + '%';
            }
        }
    }

    // Bulk operations
    showMultiple(notifications) {
        notifications.forEach(notification => {
            this.show(notification.message, notification.type, notification.options);
        });
    }

    // Position management
    setPosition(position = 'top-right') {
        const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];

        if (positions.includes(position)) {
            this.container.className = `notifications-container position-${position}`;
        }
    }

    // Theme management
    setTheme(theme = 'light') {
        this.container.classList.remove('theme-light', 'theme-dark');
        this.container.classList.add(`theme-${theme}`);
    }

    // Accessibility
    announceToScreenReader(message) {
        // Create a temporary element for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';

        announcement.textContent = message;
        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Queue system for managing multiple notifications
    queue = [];
    isProcessing = false;

    async showQueued(message, type = 'info', options = {}) {
        return new Promise((resolve) => {
            this.queue.push({ message, type, options, resolve });

            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;

        const { message, type, options, resolve } = this.queue.shift();
        const notificationId = this.show(message, type, options);

        // Wait for notification to be dismissed or timeout
        const timeout = options.duration || this.getDefaultDuration(type);

        setTimeout(() => {
            resolve(notificationId);
            this.processQueue();
        }, timeout + 300); // Add animation time
    }

    // Export/import settings
    exportSettings() {
        return {
            position: this.getCurrentPosition(),
            theme: this.getCurrentTheme(),
            maxNotifications: this.notifications.length
        };
    }

    importSettings(settings) {
        if (settings.position) {
            this.setPosition(settings.position);
        }

        if (settings.theme) {
            this.setTheme(settings.theme);
        }
    }

    getCurrentPosition() {
        const classes = Array.from(this.container.classList);
        const positionClass = classes.find(cls => cls.startsWith('position-'));
        return positionClass ? positionClass.replace('position-', '') : 'top-right';
    }

    getCurrentTheme() {
        const classes = Array.from(this.container.classList);
        const themeClass = classes.find(cls => cls.startsWith('theme-'));
        return themeClass ? themeClass.replace('theme-', '') : 'light';
    }
}

// Export for use in main.js
window.Notifications = Notifications;