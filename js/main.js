// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize all components
    initializeNavigation();
    await initializeProductGrid();
    initializeSearch();
    initializeNewsletter();
    initializeHeroSection();
    initializeSmoothScrolling();
    initializeScrollToTop();

    updateCartCount();
    updateFavoritesCount();
});

// Product data - will be loaded from admin system
let products = [];

// Helper functions for generating fake reviews and ratings
function generateFakeRating() {
    // Generate rating between 4.0 and 5.0
    return Math.round((Math.random() * 1 + 4) * 10) / 10; // 4.0 to 5.0 with 1 decimal place
}

function generateFakeReviewCount() {
    // Generate review count between 15 and 150
    return Math.floor(Math.random() * 136) + 15; // 15 to 150 reviews
}

// Load products from API
async function loadProductsFromAPI() {
    try {
        const response = await api.getProducts();
        if (response.success && response.data.products) {
            products = response.data.products.map(product => ({
                id: product._id,
                title: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.primaryImage || (product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/400x500?text=No+Image'),
                rating: product.ratings?.average || generateFakeRating(),
                reviews: product.ratings?.count || generateFakeReviewCount(),
                category: product.category,
                onSale: product.onSale || (product.originalPrice && product.originalPrice > product.price),
                showOnHomepage: product.showOnHomepage || product.featured || false,
                showOnProducts: true,
                showOnSale: product.onSale || false,
                createdDate: product.createdAt,
                featured: product.featured,
                status: product.status,
                brand: product.brand,
                description: product.description,
                variants: product.variants,
                totalStock: product.totalStock
            }));
            console.log(`Loaded ${products.length} products from API`);
        } else {
            console.log('No products found from API');
            products = [];
        }
    } catch (error) {
        console.error('Error loading products from API:', error);
        // Fallback to localStorage for backward compatibility
        await loadProductsFromLocalStorage();
    }
}

// Fallback function for localStorage (backward compatibility)
async function loadProductsFromLocalStorage() {
    try {
        const storedProducts = localStorage.getItem('vaith_products');
        if (storedProducts) {
            const adminProducts = JSON.parse(storedProducts);
            products = adminProducts.map(product => ({
                id: product.id,
                title: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x500?text=No+Image',
                rating: generateFakeRating(),
                reviews: generateFakeReviewCount(),
                category: product.category,
                onSale: product.originalPrice && product.originalPrice > product.price,
                showOnHomepage: product.showOnHomepage || false
            }));
            console.log(`Loaded ${products.length} products from localStorage (fallback)`);
        } else {
            console.log('No products found in localStorage');
            products = [];
        }
    } catch (error) {
        console.error('Error loading products from localStorage:', error);
        products = [];
    }
}

// Main product loading function
async function loadProductsFromAdmin() {
    await loadProductsFromAPI();
}

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navCenter = document.querySelector('.nav-center');
    const overlay = document.getElementById('overlay');

    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', function() {
        navCenter.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navCenter.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking overlay
    overlay?.addEventListener('click', function() {
        navCenter.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('cartModal')?.classList.remove('open');
        document.getElementById('favoritesModal')?.classList.remove('open');
    });

    // Close mobile menu when clicking a nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navCenter.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Dropdown functionality for desktop
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (window.innerWidth > 768) {
            dropdown.addEventListener('mouseenter', () => {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(0)';
            });

            dropdown.addEventListener('mouseleave', () => {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
            });
        }
    });

    // Navbar scroll effect - will be replaced by theme-aware handler
    // This is handled by updateNavbarForTheme function

    // Update navigation based on login status
    updateNavigationState();
}

// Update navigation based on user login status
function updateNavigationState() {
    const userIcon = document.querySelector('.nav-icon[href="login.html"], .nav-icon[href="user-profile.html"]');

    if (!userIcon) return; // Skip if not found (e.g., on login/signup pages)

    if (typeof authManager !== 'undefined' && authManager.isLoggedIn()) {
        const user = authManager.getCurrentUser();

        // Update user icon to link to profile
        userIcon.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-profile.html';
        userIcon.title = `${user.firstName} ${user.lastName}`;

        // Add user indicator
        userIcon.classList.add('logged-in');

    } else {
        // User not logged in
        userIcon.href = 'login.html';
        userIcon.title = 'Login';
        userIcon.classList.remove('logged-in');
    }
}

// Product grid functionality
async function initializeProductGrid() {
    // Load products from admin system first
    await loadProductsFromAdmin();

    const featuredContainer = document.getElementById('featuredProducts');
    const trendingContainer = document.getElementById('trendingProducts');

    if (featuredContainer) {
        // Filter products that should be shown on homepage
        const homepageProducts = products.filter(product => product.showOnHomepage);

        if (homepageProducts.length === 0) {
            featuredContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-color);">No Featured Products</h3>
                    <p style="margin-bottom: 1.5rem;">Featured products will appear here when you add products and select "Show on Homepage" option.</p>
                    <a href="products.html" class="btn btn-primary">Browse All Products</a>
                </div>
            `;
        } else {
            // Show up to 4 homepage products
            renderProducts(homepageProducts.slice(0, 4), featuredContainer);
            // Update button states after rendering
            setTimeout(() => {
                updateFavoriteButtons();
                updateCartButtons();
            }, 100);
        }
    }

    if (trendingContainer) {
        // Get the last 4 products added to the store (sorted by creation date)
        const allProducts = [...products]; // Create a copy to avoid mutating original array

        // Sort by creation date (newest first) - use createdDate if available, otherwise use array order
        allProducts.sort((a, b) => {
            // If products have createdDate, use it for sorting
            if (a.createdDate && b.createdDate) {
                return new Date(b.createdDate) - new Date(a.createdDate);
            }
            // Otherwise, assume products added later are at the end of the array
            return products.indexOf(b) - products.indexOf(a);
        });

        // Get the last 4 products
        const trendingProducts = allProducts.slice(0, 4);

        if (trendingProducts.length === 0) {
            trendingContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <i class="fas fa-fire" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-color);">No Latest Arrivals</h3>
                    <p style="margin-bottom: 1.5rem;">The newest products will appear here as they are added to the store.</p>
                    <a href="products.html" class="btn btn-primary">Browse All Products</a>
                </div>
            `;
        } else {
            renderProducts(trendingProducts, trendingContainer);
            // Update button states after rendering
            setTimeout(() => {
                updateFavoriteButtons();
                updateCartButtons();
            }, 100);
        }
    }
}

// Render products function
function renderProducts(productList, container) {
    container.innerHTML = '';
    
    productList.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);

    const discount = product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.title} - ${product.category} fashion item with ${product.rating} star rating" loading="lazy">
            ${product.onSale && discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">
                <span class="current-price">$${product.price}</span>
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
            </div>
            <div class="product-rating">
                <div class="stars">
                    ${generateStars(product.rating)}
                </div>
                <span class="rating-count">(${product.reviews})</span>
            </div>
            <div class="product-card-actions">
                <button class="btn btn-outline favorite-btn-text" data-product-id="${product.id}">
                    <i class="far fa-heart"></i>
                    Add to Favorites
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const favoriteBtnText = card.querySelector('.favorite-btn-text');

    // Favorite button (text) event listener
    favoriteBtnText.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(product.id, product.title);
    });



    // Navigate to product page on card click (but not on button clicks)
    card.addEventListener('click', (e) => {
        // Only navigate if the click wasn't on a button
        if (!e.target.closest('button')) {
            window.location.href = `product.html?id=${product.id}`;
        }
    });

    // Update button states for this specific card
    updateCardButtonStates(card, product.id);

    return card;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // Redirect to products page with search query
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }

    searchBtn?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Newsletter functionality
function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    newsletterForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for subscribing!');
            this.reset();
        }, 500);
    });
}

// Utility functions
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
}

// Add to cart function
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`${product.title} quantity updated in cart!`);
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        showNotification(`${product.title} added to cart!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartButtons();
}

// Remove from cart by product ID function
function removeFromCartByProductId(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productToRemove = cart.find(item => item.id === productId);

    if (productToRemove) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartButtons();
        showNotification(`${productToRemove.title} removed from cart!`);
    }
}

// Toggle favorite function
function toggleFavorite(productId, productTitle = 'Product') {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(productId);

    if (index > -1) {
        favorites.splice(index, 1);
        // showNotification(`${productTitle} removed from favorites`);
    } else {
        favorites.push(productId);
        // showNotification(`${productTitle} added to favorites!`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    updateFavoriteButtons();
}

// Update favorite button states
function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Update icon favorite buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        const icon = btn.querySelector('i');

        if (favorites.includes(productId)) {
            icon.className = 'fas fa-heart';
            btn.style.color = '#4B0082';
        } else {
            icon.className = 'far fa-heart';
            btn.style.color = '';
        }
    });

    // Update text favorite buttons
    const favoriteTextButtons = document.querySelectorAll('.favorite-btn-text');
    favoriteTextButtons.forEach(btn => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        const icon = btn.querySelector('i');

        if (favorites.includes(productId)) {
            icon.className = 'fas fa-heart';
            btn.classList.add('favorited');
            btn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            btn.style.background = '#4B0082';
            btn.style.color = 'white';
            btn.style.borderColor = '#4B0082';
        } else {
            icon.className = 'far fa-heart';
            btn.classList.remove('favorited');
            btn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }
    });
}

// Update cart button states
function updateCartButtons() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartProductIds = cart.map(item => item.id);

    // Update add to cart buttons
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    cartButtons.forEach(btn => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        const icon = btn.querySelector('i');

        if (cartProductIds.includes(productId)) {
            btn.classList.add('in-cart');
            btn.innerHTML = '<i class="fas fa-times"></i> Remove from Cart';
            btn.style.background = '#dc3545';
            btn.style.borderColor = '#dc3545';
            btn.style.color = 'white';
            btn.title = 'Remove from Cart';
        } else {
            btn.classList.remove('in-cart');
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.title = 'Add to Cart';
        }
    });
}

// Update button states for a specific card
function updateCardButtonStates(card, productId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Update favorite text button in this card
    const favoriteBtnText = card.querySelector('.favorite-btn-text');
    if (favoriteBtnText) {
        const icon = favoriteBtnText.querySelector('i');
        if (favorites.includes(productId)) {
            icon.className = 'fas fa-heart';
            favoriteBtnText.classList.add('favorited');
            favoriteBtnText.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            favoriteBtnText.style.background = '#4B0082';
            favoriteBtnText.style.color = 'white';
            favoriteBtnText.style.borderColor = '#4B0082';
        } else {
            icon.className = 'far fa-heart';
            favoriteBtnText.classList.remove('favorited');
            favoriteBtnText.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            favoriteBtnText.style.background = '';
            favoriteBtnText.style.color = '';
            favoriteBtnText.style.borderColor = '';
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    let backgroundColor = '#4B0082'; // Default success color
    if (type === 'error') {
        backgroundColor = '#e74c3c';
    } else if (type === 'warning') {
        backgroundColor = '#f39c12';
    } else if (type === 'info') {
        backgroundColor = '#3498db';
    }

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1003;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Remove notification after 3-4 seconds (longer for errors)
    const duration = type === 'error' ? 4000 : 3000;
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Add CSS for notifications and navigation states
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    /* Logged in user indicator */
    .nav-icon.logged-in {
        position: relative;
    }

    .nav-icon.logged-in::after {
        content: '';
        position: absolute;
        top: 2px;
        right: 2px;
        width: 8px;
        height: 8px;
        background: #27ae60;
        border-radius: 50%;
        border: 2px solid var(--card-bg);
    }
`;
document.head.appendChild(style);

// Initialize favorite and cart button states on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateFavoriteButtons, 100);
    setTimeout(updateCartButtons, 100);
    setTimeout(updateNavigationState, 200); // Update navigation after auth manager is loaded
});

// Sync button states across tabs when localStorage changes
window.addEventListener('storage', function(e) {
    if (e.key === 'favorites') {
        updateFavoriteButtons();
    }
    if (e.key === 'cart') {
        updateCartButtons();
    }
});

// Theme toggle functionality is handled by theme-toggle.js
// This file focuses on other main functionality

// Smooth scrolling functionality
function initializeSmoothScrolling() {
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add smooth scrolling to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Add a small delay for visual feedback before navigation
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });

    // Add smooth scrolling to scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.sales-section');
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
        scrollIndicator.style.cursor = 'pointer';
    }
}

// Scroll to top functionality
function initializeScrollToTop() {
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.setAttribute('title', 'Scroll to top');
    document.body.appendChild(scrollToTopBtn);

    // Show/hide scroll to top button based on scroll position
    function toggleScrollToTopButton() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Listen for scroll events
    window.addEventListener('scroll', toggleScrollToTopButton);

    // Initial check
    toggleScrollToTopButton();
}

// Enhanced scroll animations for sections
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.categories, .featured-products, .trending, .newsletter');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Initialize Hero Section with animated text
function initializeHeroSection() {
    const heroTitle = document.querySelector('.hero-content h1');
    if (!heroTitle) return;

    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';

    // Create typewriter effect
    function typeWriter(text, element, speed = 100) {
        let i = 0;
        element.innerHTML = '';

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
            // Removed the blinking cursor - typing completes without cursor
        }

        // Start typing after a short delay
        setTimeout(type, 1000);
    }

    // Start the typewriter effect
    typeWriter(originalText, heroTitle, 150);
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addScrollAnimations, 500); // Small delay to ensure all elements are rendered
});
