/**
 * Navigation Component - Handles mobile menu, dropdowns, and navigation interactions
 */

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupSearch();
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Close mobile menu on outside click
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Close mobile menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupMobileMenu() {
        // Create mobile menu toggle if it doesn't exist
        const navbar = document.querySelector('.navbar');
        const navbarNav = document.querySelector('.navbar-nav');

        if (navbar && navbarNav && !document.querySelector('.mobile-menu-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'mobile-menu-toggle';
            toggle.setAttribute('aria-label', 'Toggle navigation menu');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = `
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            `;

            // Insert toggle before navbar-nav
            navbarNav.parentNode.insertBefore(toggle, navbarNav);

            // Clone navbar-nav for mobile
            const mobileNav = navbarNav.cloneNode(true);
            mobileNav.classList.add('mobile');
            navbar.appendChild(mobileNav);

            // Re-bind events for mobile nav
            this.bindMobileNavEvents(mobileNav);
        }
    }

    bindMobileNavEvents(mobileNav) {
        // Handle mobile dropdowns
        const dropdownToggles = mobileNav.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileDropdown(toggle);
            });
        });

        // Handle mobile nav links
        const links = mobileNav.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.navbar-nav.mobile');
        const toggle = document.querySelector('.mobile-menu-toggle');

        if (mobileMenu && toggle) {
            const isOpen = mobileMenu.classList.contains('active');

            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileMenu = document.querySelector('.navbar-nav.mobile');
        const toggle = document.querySelector('.mobile-menu-toggle');
        const body = document.body;

        if (mobileMenu && toggle) {
            mobileMenu.classList.add('active');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('mobile-menu-open');

            // Focus management
            const firstLink = mobileMenu.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
            }

            // Prevent body scroll
            body.style.overflow = 'hidden';
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.navbar-nav.mobile');
        const toggle = document.querySelector('.mobile-menu-toggle');
        const body = document.body;

        if (mobileMenu && toggle) {
            mobileMenu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('mobile-menu-open');

            // Restore body scroll
            body.style.overflow = '';

            // Return focus to toggle
            toggle.focus();
        }
    }

    toggleMobileDropdown(toggle) {
        const dropdown = toggle.closest('.dropdown');
        const isOpen = dropdown.classList.contains('active');

        // Close all mobile dropdowns first
        document.querySelectorAll('.navbar-nav.mobile .dropdown.active').forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('active');
            }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('active');

        // Update aria-expanded
        toggle.setAttribute('aria-expanded', !isOpen);
    }

    setupDropdowns() {
        // Desktop dropdowns
        const dropdowns = document.querySelectorAll('.dropdown:not(.mobile .dropdown)');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');

            if (toggle) {
                // Mouse events for desktop
                dropdown.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        this.openDropdown(dropdown);
                    }
                });

                dropdown.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 768) {
                        this.closeDropdown(dropdown);
                    }
                });

                // Click events for touch devices
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                    }
                });

                // Keyboard navigation
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                    } else if (e.key === 'Escape') {
                        this.closeDropdown(dropdown);
                        toggle.focus();
                    }
                });
            }
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('active');

        if (isOpen) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        // Close other dropdowns
        document.querySelectorAll('.dropdown.active').forEach(d => {
            if (d !== dropdown) {
                this.closeDropdown(d);
            }
        });

        dropdown.classList.add('active');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    setupSearch() {
        const searchForm = document.querySelector('.navbar-search');
        if (!searchForm) return;

        const searchInput = searchForm.querySelector('input');
        const searchButton = searchForm.querySelector('button');

        if (searchInput) {
            // Search input events
            searchInput.addEventListener('focus', () => {
                searchForm.classList.add('focused');
                this.showSearchSuggestions();
            });

            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    searchForm.classList.remove('focused');
                    this.hideSearchSuggestions();
                }, 150);
            });

            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(searchInput.value);
                } else if (e.key === 'Escape') {
                    searchInput.blur();
                    this.hideSearchSuggestions();
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (searchInput) {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    showSearchSuggestions() {
        let suggestions = document.querySelector('.search-suggestions');

        if (!suggestions) {
            suggestions = document.createElement('div');
            suggestions.className = 'search-suggestions';
            suggestions.innerHTML = `
                <div class="suggestions-header">
                    <h4>Popular searches</h4>
                </div>
                <ul class="suggestions-list">
                    <li><a href="#" data-search="handmade jewelry">Handmade jewelry</a></li>
                    <li><a href="#" data-search="vintage clothing">Vintage clothing</a></li>
                    <li><a href="#" data-search="home decor">Home decor</a></li>
                    <li><a href="#" data-search="wedding gifts">Wedding gifts</a></li>
                    <li><a href="#" data-search="art prints">Art prints</a></li>
                </ul>
                <div class="recent-searches" style="display: none;">
                    <h4>Recent searches</h4>
                    <ul class="recent-list"></ul>
                </div>
            `;

            const searchForm = document.querySelector('.navbar-search');
            if (searchForm) {
                searchForm.appendChild(suggestions);
            }

            // Bind suggestion clicks
            suggestions.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    const searchTerm = e.target.dataset.search;
                    this.performSearch(searchTerm);
                }
            });
        }

        suggestions.style.display = 'block';
        this.loadRecentSearches();
    }

    hideSearchSuggestions() {
        const suggestions = document.querySelector('.search-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    handleSearchInput(value) {
        const suggestions = document.querySelector('.search-suggestions');
        if (!suggestions) return;

        if (value.trim().length === 0) {
            // Show popular searches
            suggestions.querySelector('.suggestions-header h4').textContent = 'Popular searches';
            suggestions.querySelector('.suggestions-list').style.display = 'block';
            suggestions.querySelector('.recent-searches').style.display = 'none';
        } else {
            // Show filtered suggestions or search results
            suggestions.querySelector('.suggestions-header h4').textContent = 'Search suggestions';
            // In a real app, this would filter suggestions based on input
        }
    }

    performSearch(query) {
        if (!query.trim()) return;

        // Save to recent searches
        this.saveRecentSearch(query);

        // Hide suggestions
        this.hideSearchSuggestions();

        // Clear search input
        const searchInput = document.querySelector('.navbar-search input');
        if (searchInput) {
            searchInput.blur();
        }

        // Navigate to search results
        const searchUrl = `/search?q=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
    }

    saveRecentSearch(query) {
        const recentSearches = this.getRecentSearches();
        const filtered = recentSearches.filter(search => search !== query);
        filtered.unshift(query);

        // Keep only last 5 searches
        const limited = filtered.slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(limited));
    }

    getRecentSearches() {
        try {
            const searches = localStorage.getItem('recentSearches');
            return searches ? JSON.parse(searches) : [];
        } catch (e) {
            return [];
        }
    }

    loadRecentSearches() {
        const recentSearches = this.getRecentSearches();
        const recentList = document.querySelector('.recent-list');
        const recentSearchesDiv = document.querySelector('.recent-searches');

        if (recentList && recentSearches.length > 0) {
            recentList.innerHTML = recentSearches
                .map(search => `<li><a href="#" data-search="${search}">${search}</a></li>`)
                .join('');

            recentSearchesDiv.style.display = 'block';
        } else {
            recentSearchesDiv.style.display = 'none';
        }
    }

    handleOutsideClick(e) {
        // Close mobile menu when clicking outside
        const mobileMenu = document.querySelector('.navbar-nav.mobile');
        const toggle = document.querySelector('.mobile-menu-toggle');

        if (mobileMenu && toggle && !mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
            this.closeMobileMenu();
        }
    }

    handleResize() {
        // Close mobile menu on desktop resize
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    // Sticky navigation
    setupStickyNavigation() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const stickyClass = 'sticky';
        const stickyOffset = navbar.offsetTop;

        const handleScroll = () => {
            if (window.pageYOffset > stickyOffset) {
                navbar.classList.add(stickyClass);
            } else {
                navbar.classList.remove(stickyClass);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state
    }

    // Breadcrumbs navigation
    setupBreadcrumbs() {
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (!breadcrumbs) return;

        // Add click tracking or other breadcrumb functionality
        const links = breadcrumbs.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Could add analytics tracking here
                console.log('Breadcrumb clicked:', link.textContent);
            });
        });
    }

    // User menu functionality
    setupUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        if (!userMenu) return;

        const userToggle = userMenu.querySelector('.user-menu-toggle');
        const userDropdown = userMenu.querySelector('.user-dropdown');

        if (userToggle && userDropdown) {
            userToggle.addEventListener('click', (e) => {
                e.preventDefault();
                userMenu.classList.toggle('active');
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });
        }
    }
}

// Export for use in main.js
window.Navigation = Navigation;