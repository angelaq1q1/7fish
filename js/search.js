/**
 * Search Component - Handles search functionality, filters, and results
 */

class Search {
    constructor() {
        this.searchTimeout = null;
        this.currentQuery = '';
        this.currentFilters = {};
        this.currentPage = 1;
        this.hasMoreResults = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupSearchPage();
        this.setupFilters();
        this.setupSorting();
    }

    bindEvents() {
        // Main search form
        const searchForm = document.querySelector('.search-form, .navbar-search');
        if (searchForm) {
            const searchInput = searchForm.querySelector('input[type="search"], input[type="text"]');
            const searchButton = searchForm.querySelector('button[type="submit"]');

            if (searchInput) {
                searchInput.addEventListener('input', this.handleSearchInput.bind(this));
                searchInput.addEventListener('focus', this.showSearchDropdown.bind(this));
                searchInput.addEventListener('blur', () => {
                    setTimeout(() => this.hideSearchDropdown(), 150);
                });
            }

            if (searchButton) {
                searchButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.performSearch();
                });
            }
        }

        // Search results page specific
        this.bindSearchResultsEvents();
    }

    setupSearchPage() {
        // Check if we're on a search results page
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (query) {
            this.currentQuery = query;
            this.loadSearchResults();
        }
    }

    handleSearchInput(e) {
        const query = e.target.value.trim();

        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length === 0) {
            this.hideSearchDropdown();
            return;
        }

        // Debounce search suggestions
        this.searchTimeout = setTimeout(() => {
            this.loadSearchSuggestions(query);
        }, 300);
    }

    showSearchDropdown() {
        let dropdown = document.querySelector('.search-dropdown');

        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown';
            dropdown.innerHTML = `
                <div class="search-suggestions">
                    <div class="suggestions-header">
                        <h4>Search suggestions</h4>
                    </div>
                    <ul class="suggestions-list"></ul>
                </div>
                <div class="recent-searches">
                    <h4>Recent searches</h4>
                    <ul class="recent-list"></ul>
                </div>
                <div class="trending-searches">
                    <h4>Trending now</h4>
                    <ul class="trending-list"></ul>
                </div>
            `;

            const searchForm = document.querySelector('.search-form, .navbar-search');
            if (searchForm) {
                searchForm.appendChild(dropdown);
            }

            // Bind suggestion clicks
            dropdown.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    const suggestion = e.target.dataset.suggestion;
                    this.selectSuggestion(suggestion);
                }
            });
        }

        dropdown.style.display = 'block';
        this.loadRecentSearches();
        this.loadTrendingSearches();
    }

    hideSearchDropdown() {
        const dropdown = document.querySelector('.search-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    loadSearchSuggestions(query) {
        const suggestionsList = document.querySelector('.suggestions-list');
        if (!suggestionsList) return;

        // Mock suggestions - in real app, this would be an API call
        const suggestions = [
            `${query} handmade`,
            `${query} vintage`,
            `${query} unique`,
            `${query} custom`,
            `${query} personalized`
        ];

        suggestionsList.innerHTML = suggestions
            .map(suggestion => `<li><a href="#" data-suggestion="${suggestion}">${suggestion}</a></li>`)
            .join('');

        // Show suggestions section
        const suggestionsDiv = document.querySelector('.search-suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'block';
        }
    }

    loadRecentSearches() {
        const recentSearches = this.getRecentSearches();
        const recentList = document.querySelector('.recent-list');
        const recentSearchesDiv = document.querySelector('.recent-searches');

        if (recentList && recentSearches.length > 0) {
            recentList.innerHTML = recentSearches
                .map(search => `<li><a href="#" data-suggestion="${search}">${search}</a></li>`)
                .join('');
            recentSearchesDiv.style.display = 'block';
        } else {
            recentSearchesDiv.style.display = 'none';
        }
    }

    loadTrendingSearches() {
        // Mock trending searches
        const trendingSearches = [
            'handmade jewelry',
            'vintage clothing',
            'home decor',
            'wedding gifts',
            'art prints',
            'custom mugs'
        ];

        const trendingList = document.querySelector('.trending-list');
        if (trendingList) {
            trendingList.innerHTML = trendingSearches
                .map(search => `<li><a href="#" data-suggestion="${search}">${search}</a></li>`)
                .join('');
        }
    }

    getRecentSearches() {
        try {
            const searches = localStorage.getItem('recentSearches');
            return searches ? JSON.parse(searches) : [];
        } catch (e) {
            return [];
        }
    }

    selectSuggestion(suggestion) {
        const searchInput = document.querySelector('.search-form input, .navbar-search input');
        if (searchInput) {
            searchInput.value = suggestion;
            this.hideSearchDropdown();
            this.performSearch(suggestion);
        }
    }

    performSearch(query = null) {
        const searchInput = document.querySelector('.search-form input, .navbar-search input');
        const searchQuery = query || (searchInput ? searchInput.value.trim() : '');

        if (!searchQuery) return;

        // Save to recent searches
        this.saveRecentSearch(searchQuery);

        // Navigate to search results
        const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
        window.location.href = searchUrl;
    }

    saveRecentSearch(query) {
        const recentSearches = this.getRecentSearches();
        const filtered = recentSearches.filter(search => search !== query);
        filtered.unshift(query);

        // Keep only last 10 searches
        const limited = filtered.slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(limited));
    }

    loadSearchResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        this.showLoadingState();

        // Mock API call - in real app, this would be an actual API request
        setTimeout(() => {
            this.renderSearchResults(this.getMockSearchResults());
            this.hideLoadingState();
        }, 1000);
    }

    showLoadingState() {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Searching...</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        const loadingState = document.querySelector('.loading-state');
        if (loadingState) {
            loadingState.remove();
        }
    }

    renderSearchResults(results) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        const { items, total, query } = results;

        if (items.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No results found for "${query}"</h3>
                    <p>Try adjusting your search terms or browse our categories.</p>
                    <div class="popular-categories">
                        <h4>Popular categories</h4>
                        <div class="categories-grid">
                            <a href="/category/jewelry" class="category-card">
                                <img src="https://via.placeholder.com/150x150/FFE4E1/FF6B6B?text=Jewelry" alt="Jewelry">
                                <span>Jewelry</span>
                            </a>
                            <a href="/category/clothing" class="category-card">
                                <img src="https://via.placeholder.com/150x150/E8F4F8/74B9FF?text=Clothing" alt="Clothing">
                                <span>Clothing</span>
                            </a>
                            <a href="/category/home" class="category-card">
                                <img src="https://via.placeholder.com/150x150/F0F8E7/6FAF5A?text=Home" alt="Home">
                                <span>Home & Living</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-header">
                <h2>${total} results for "${query}"</h2>
                <div class="search-actions">
                    <button class="btn btn-outline save-search-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Save this search
                    </button>
                </div>
            </div>
            <div class="products-grid">
                ${items.map(item => this.renderProductCard(item)).join('')}
            </div>
            ${this.hasMoreResults ? `
                <div class="load-more-container">
                    <button class="btn btn-primary load-more-btn">Load more results</button>
                    <div class="loading-indicator" style="display: none;">
                        <div class="loading-spinner"></div>
                        <span>Loading...</span>
                    </div>
                </div>
            ` : ''}
        `;

        // Bind load more button
        const loadMoreBtn = resultsContainer.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', this.loadMoreResults.bind(this));
        }

        // Bind save search
        const saveSearchBtn = resultsContainer.querySelector('.save-search-btn');
        if (saveSearchBtn) {
            saveSearchBtn.addEventListener('click', this.saveSearch.bind(this));
        }
    }

    renderProductCard(item) {
        return `
            <div class="product-card" data-product-id="${item.id}">
                <div class="product-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <button class="product-like-btn" data-product-id="${item.id}" aria-label="Add to favorites">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${item.title}</h3>
                    <div class="product-price">$${item.price}</div>
                    <div class="product-seller">by ${item.seller}</div>
                    <div class="product-rating">
                        <div class="stars" data-rating="${item.rating}">
                            ${this.renderStars(item.rating)}
                        </div>
                        <span class="review-count">(${item.reviews})</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        // Half star
        if (hasHalfStar) {
            stars += '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clip-path="inset(0 50% 0 0)"/></svg>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        return stars;
    }

    setupFilters() {
        const filterForm = document.querySelector('.search-filters');
        if (!filterForm) return;

        // Price range slider
        const priceRange = filterForm.querySelector('.price-range');
        if (priceRange) {
            this.setupPriceRange(priceRange);
        }

        // Category checkboxes
        const categoryCheckboxes = filterForm.querySelectorAll('input[name="category"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.handleFilterChange.bind(this));
        });

        // Sort dropdown
        const sortSelect = filterForm.querySelector('select[name="sort"]');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        // Clear filters button
        const clearFiltersBtn = filterForm.querySelector('.clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', this.clearFilters.bind(this));
        }
    }

    setupPriceRange(priceRange) {
        const minInput = priceRange.querySelector('.price-min');
        const maxInput = priceRange.querySelector('.price-max');
        const minSlider = priceRange.querySelector('.price-slider-min');
        const maxSlider = priceRange.querySelector('.price-slider-max');

        if (minInput && maxInput && minSlider && maxSlider) {
            // Sync inputs with sliders
            minSlider.addEventListener('input', () => {
                minInput.value = minSlider.value;
                this.updatePriceDisplay();
            });

            maxSlider.addEventListener('input', () => {
                maxInput.value = maxSlider.value;
                this.updatePriceDisplay();
            });

            // Sync sliders with inputs
            minInput.addEventListener('input', () => {
                minSlider.value = minInput.value;
                this.updatePriceDisplay();
            });

            maxInput.addEventListener('input', () => {
                maxSlider.value = maxInput.value;
                this.updatePriceDisplay();
            });

            // Trigger filter change
            [minSlider, maxSlider, minInput, maxInput].forEach(element => {
                element.addEventListener('change', this.handleFilterChange.bind(this));
            });
        }
    }

    updatePriceDisplay() {
        const priceRange = document.querySelector('.price-range');
        if (!priceRange) return;

        const minValue = priceRange.querySelector('.price-min').value;
        const maxValue = priceRange.querySelector('.price-max').value;
        const display = priceRange.querySelector('.price-display');

        if (display) {
            display.textContent = `$${minValue} - $${maxValue}`;
        }
    }

    setupSorting() {
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }
    }

    handleFilterChange() {
        // Collect all active filters
        this.currentFilters = this.collectFilters();

        // Reset to page 1 when filters change
        this.currentPage = 1;

        // Reload results
        this.loadSearchResults();
    }

    handleSortChange(e) {
        this.currentFilters.sort = e.target.value;
        this.currentPage = 1;
        this.loadSearchResults();
    }

    collectFilters() {
        const filters = {};

        // Categories
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        if (categoryCheckboxes.length > 0) {
            filters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
        }

        // Price range
        const minPrice = document.querySelector('.price-min');
        const maxPrice = document.querySelector('.price-max');
        if (minPrice && maxPrice) {
            filters.minPrice = minPrice.value;
            filters.maxPrice = maxPrice.value;
        }

        // Other filters can be added here

        return filters;
    }

    clearFilters() {
        // Reset all filters
        const filterForm = document.querySelector('.search-filters');
        if (!filterForm) return;

        // Reset checkboxes
        const checkboxes = filterForm.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset price range
        const minInput = filterForm.querySelector('.price-min');
        const maxInput = filterForm.querySelector('.price-max');
        if (minInput && maxInput) {
            minInput.value = minInput.min || 0;
            maxInput.value = maxInput.max || 500;
        }

        // Clear current filters
        this.currentFilters = {};
        this.currentPage = 1;

        // Reload results
        this.loadSearchResults();
    }

    loadMoreResults() {
        if (!this.hasMoreResults) return;

        const loadMoreBtn = document.querySelector('.load-more-btn');
        const loadingIndicator = document.querySelector('.loading-indicator');

        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }

        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }

        this.currentPage++;

        // Mock API call for more results
        setTimeout(() => {
            const moreResults = this.getMockSearchResults(this.currentPage);

            if (moreResults.items.length > 0) {
                const productsGrid = document.querySelector('.products-grid');
                if (productsGrid) {
                    moreResults.items.forEach(item => {
                        const productCard = document.createElement('div');
                        productCard.innerHTML = this.renderProductCard(item);
                        productsGrid.appendChild(productCard.firstElementChild);
                    });
                }
            } else {
                this.hasMoreResults = false;
            }

            if (loadMoreBtn) {
                loadMoreBtn.style.display = this.hasMoreResults ? 'block' : 'none';
            }

            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }, 1000);
    }

    saveSearch() {
        // Mock save search functionality
        const searchData = {
            query: this.currentQuery,
            filters: this.currentFilters,
            savedAt: new Date().toISOString()
        };

        // In real app, this would save to user account
        let savedSearches = [];
        try {
            const saved = localStorage.getItem('savedSearches');
            savedSearches = saved ? JSON.parse(saved) : [];
        } catch (e) {}

        savedSearches.push(searchData);
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));

        // Show success message
        if (typeof Notifications !== 'undefined') {
            this.notifications.show('Search saved! You\'ll get notified when new items match your criteria.', 'success');
        }

        // Update button
        const saveBtn = document.querySelector('.save-search-btn');
        if (saveBtn) {
            saveBtn.textContent = 'Search saved';
            saveBtn.disabled = true;
        }
    }

    bindSearchResultsEvents() {
        // Product card interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.product-like-btn')) {
                e.preventDefault();
                // Handled by main.js
            }
        });
    }

    getMockSearchResults(page = 1) {
        // Mock search results data
        const mockItems = [
            {
                id: 1,
                title: 'Handmade Leather Crossbody Bag',
                price: '89.99',
                image: 'https://via.placeholder.com/280x240/FFE4E1/FF6B6B?text=Handmade+Bag',
                seller: 'ArtisanLeather',
                rating: 4.8,
                reviews: 124
            },
            {
                id: 2,
                title: 'Ceramic Vase with Blue Glaze',
                price: '45.00',
                image: 'https://via.placeholder.com/280x240/E8F4F8/74B9FF?text=Ceramic+Vase',
                seller: 'PotteryArt',
                rating: 4.9,
                reviews: 89
            },
            {
                id: 3,
                title: 'Merino Wool Throw Blanket',
                price: '120.00',
                image: 'https://via.placeholder.com/280x240/F0F8E7/6FAF5A?text=Wool+Blanket',
                seller: 'WoolWorks',
                rating: 4.7,
                reviews: 203
            },
            {
                id: 4,
                title: 'Live Edge Wooden Salad Bowl',
                price: '65.00',
                image: 'https://via.placeholder.com/280x240/FFF2E8/FF8C42?text=Wooden+Bowl',
                seller: 'WoodCraft',
                rating: 4.6,
                reviews: 67
            },
            {
                id: 5,
                title: 'Vintage Style Reading Glasses',
                price: '35.00',
                image: 'https://via.placeholder.com/280x240/FDEAF8/6B46C1?text=Reading+Glasses',
                seller: 'VintageOptics',
                rating: 4.5,
                reviews: 156
            },
            {
                id: 6,
                title: 'Hand-painted Silk Scarf',
                price: '55.00',
                image: 'https://via.placeholder.com/280x240/FFE4E1/FF69B4?text=Silk+Scarf',
                seller: 'SilkArtist',
                rating: 4.9,
                reviews: 78
            }
        ];

        // Simulate pagination
        const itemsPerPage = 6;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = mockItems.slice(startIndex, endIndex);

        return {
            query: this.currentQuery,
            items: pageItems,
            total: mockItems.length,
            page: page,
            hasMore: endIndex < mockItems.length
        };
    }
}

// Export for use in main.js
window.Search = Search;