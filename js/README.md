# 7Fish JavaScript Framework

A comprehensive JavaScript framework inspired by Etsy, providing interactive components, API integration, and modern web development utilities.

## 📁 File Structure

```
js/
├── main.js          # Main entry point - initializes all components
├── navigation.js    # Navigation, mobile menu, dropdowns
├── search.js        # Search functionality with filters
├── cart.js          # Shopping cart management
├── modal.js         # Modal dialogs and overlays
├── notifications.js # Toast notifications system
├── utils.js         # Utility functions and helpers
├── api.js           # API communication layer
└── README.md        # This documentation
```

## 🚀 Quick Start

Include all JavaScript files in your HTML:

```html
<!-- Include all framework files -->
<script src="js/utils.js"></script>
<script src="js/api.js"></script>
<script src="js/notifications.js"></script>
<script src="js/modal.js"></script>
<script src="js/navigation.js"></script>
<script src="js/search.js"></script>
<script src="js/cart.js"></script>
<script src="js/main.js"></script>
```

The `main.js` file automatically initializes all components when the DOM is ready.

## 🧩 Components

### Navigation (`Navigation`)

Handles mobile menus, dropdowns, and search functionality.

```javascript
// Access the navigation instance
const nav = window.Navigation;

// Programmatically control navigation
nav.openMobileMenu();
nav.closeMobileMenu();
nav.toggleDropdown(dropdownElement);
```

**HTML Structure:**
```html
<nav class="navbar">
  <div class="container navbar-container">
    <a href="#" class="navbar-brand">Brand</a>

    <!-- Mobile menu toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle navigation">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Search -->
    <form class="navbar-search">
      <input type="search" placeholder="Search...">
      <button type="submit">Search</button>
    </form>

    <!-- Navigation menu -->
    <ul class="navbar-nav">
      <li><a href="#" class="navbar-link">Home</a></li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle">Categories</a>
        <ul class="dropdown-menu">
          <li><a href="#">Jewelry</a></li>
          <li><a href="#">Clothing</a></li>
        </ul>
      </li>
    </ul>
  </div>
</nav>
```

### Search (`Search`)

Advanced search with filters, suggestions, and results management.

```javascript
// Access search instance
const search = window.Search;

// Perform search
search.performSearch('handmade jewelry');

// Load search results
search.loadSearchResults();

// Update filters
search.handleFilterChange();
```

### Shopping Cart (`Cart`)

Complete cart management with persistence and UI updates.

```javascript
// Access cart instance
const cart = window.Cart;

// Add items to cart
cart.addItem(productId, quantity);

// Update quantities
cart.updateQuantity(productId, 2);

// Remove items
cart.removeItem(productId);

// Get cart data
const cartData = cart.getCartData();
```

**HTML Structure:**
```html
<!-- Cart toggle in navbar -->
<button class="cart-toggle">
  <span class="cart-count">0</span>
</button>

<!-- Cart dropdown -->
<div class="cart-dropdown">
  <div class="cart-items">
    <!-- Cart items will be populated here -->
  </div>
  <div class="cart-footer">
    <div class="cart-footer-total">Total: $0.00</div>
    <a href="/cart" class="btn btn-primary">View Cart</a>
  </div>
</div>
```

### Modals (`Modal`)

Flexible modal system with accessibility features.

```javascript
// Access modal instance
const modal = window.Modal;

// Show alert
await modal.alert('This is an alert message');

// Show confirmation
const confirmed = await modal.confirm('Are you sure?');

// Show custom modal
modal.show('<p>Custom content</p>', {
  title: 'My Modal',
  footer: '<button>Close</button>'
});

// Show image gallery
modal.showImageGallery(images, startIndex);
```

### Notifications (`Notifications`)

Toast notification system with multiple types and positions.

```javascript
// Access notifications instance
const notifications = window.Notifications;

// Show different types of notifications
notifications.success('Item added to cart!');
notifications.error('Failed to save changes');
notifications.warning('Please review your input');
notifications.info('New message received');

// Show with actions
notifications.confirm('Delete this item?', {
  confirmText: 'Delete',
  onConfirm: () => console.log('Deleted')
});
```

### API (`API`)

Complete API communication layer with error handling and caching.

```javascript
// Access API instance
const api = window.API;

// Authentication
await api.login({ email, password });
await api.logout();

// Products
const products = await api.getProducts({ category: 'jewelry' });
const product = await api.getProduct(123);

// Cart operations
await api.addToCart(productId, quantity);
const cart = await api.getCart();

// Search
const results = await api.search('handmade', { category: 'jewelry' });
```

### Utilities (`Utils`)

Comprehensive utility functions for common tasks.

```javascript
// Access utils instance
const utils = window.Utils;

// Formatting
utils.formatCurrency(29.99); // "$29.99"
utils.formatDate(new Date()); // "Jan 6, 2024"
utils.formatRelativeTime(new Date()); // "2 hours ago"

// Debouncing and throttling
const debouncedFn = utils.debounce(myFunction, 300);
const throttledFn = utils.throttle(myFunction, 100);

// Storage helpers
utils.storage.set('key', { data: 'value' });
const data = utils.storage.get('key');

// Device detection
if (utils.device.isMobile()) {
  // Mobile-specific code
}
```

## 🎯 Event System

The framework uses custom events for component communication:

```javascript
// Listen for events
document.addEventListener('modalOpened', (e) => {
  console.log('Modal opened:', e.detail.modalId);
});

document.addEventListener('cartUpdated', (e) => {
  console.log('Cart was updated');
});

// Dispatch custom events
document.dispatchEvent(new CustomEvent('customEvent', {
  detail: { data: 'value' }
}));
```

## 🔧 Configuration

### API Configuration

```javascript
// Set API base URL
window.API.baseURL = 'https://api.yoursite.com';

// Set authentication token
window.API.setAuthToken('your-jwt-token');
```

### Notification Configuration

```javascript
// Set notification position
window.Notifications.setPosition('bottom-left');

// Set theme
window.Notifications.setTheme('dark');
```

## 🎨 Styling Integration

The JavaScript components work seamlessly with the CSS framework. Add corresponding CSS classes to your HTML:

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-outline">Outline Button</button>

<!-- Forms -->
<form class="search-form">
  <input type="text" class="form-input" placeholder="Search...">
  <button type="submit" class="btn btn-primary">Search</button>
</form>

<!-- Cards -->
<div class="product-card">
  <img src="..." alt="Product" class="product-card-image">
  <div class="product-card-content">
    <h3 class="product-card-title">Product Title</h3>
    <div class="product-card-price">$29.99</div>
  </div>
</div>
```

## 📱 Responsive Behavior

All components automatically adapt to different screen sizes:

- **Desktop**: Full navigation, hover dropdowns
- **Tablet**: Touch-friendly interactions
- **Mobile**: Collapsible navigation, swipe gestures

## ♿ Accessibility

The framework includes comprehensive accessibility features:

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- High contrast support

## 🔄 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🛠️ Development

### Adding New Components

1. Create a new class extending the base functionality
2. Add initialization logic to `main.js`
3. Export the class to the global scope
4. Document the component in this README

### Error Handling

All components include comprehensive error handling:

```javascript
try {
  const result = await api.getProducts();
  // Handle success
} catch (error) {
  notifications.error('Failed to load products');
  console.error(error);
}
```

### Testing

Components can be tested individually:

```javascript
// Test modal functionality
const modal = new Modal();
modal.show('<p>Test content</p>');
```

## 📊 Performance

The framework is optimized for performance:

- **Lazy loading**: Components load only when needed
- **Debouncing**: Input events are debounced to reduce API calls
- **Caching**: API responses are cached to reduce network requests
- **Minification**: Code is structured for effective minification

## 🔒 Security

Security considerations:

- **XSS Protection**: All user input is sanitized
- **CSRF Protection**: API requests include CSRF tokens
- **Secure Storage**: Sensitive data is stored securely
- **Input Validation**: All form inputs are validated

## 📖 Examples

See `../index.html` for complete examples of all components in action.

## 🤝 Contributing

When adding new features:

1. Follow the existing code style
2. Add comprehensive error handling
3. Include accessibility features
4. Update this documentation
5. Test across different browsers

## 📄 License

This JavaScript framework is designed to work with the 7Fish CSS framework and follows Etsy-inspired design patterns.