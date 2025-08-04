// Favorites functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFavorites();
});

function initializeFavorites() {
    const favoritesBtn = document.getElementById('favoritesBtn');
    const favoritesModal = document.getElementById('favoritesModal');
    const closeFavoritesBtn = document.getElementById('closeFavorites');
    const overlay = document.getElementById('overlay');

    // Open favorites modal
    favoritesBtn?.addEventListener('click', function() {
        favoritesModal.classList.add('open');
        overlay.classList.add('active');
        renderFavoriteItems();
    });

    // Close favorites modal
    closeFavoritesBtn?.addEventListener('click', function() {
        favoritesModal.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Close modal when clicking overlay
    overlay?.addEventListener('click', function() {
        favoritesModal.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Initial favorites render
    updateFavoritesCount();
}

function renderFavoriteItems() {
    const favoritesContainer = document.getElementById('favoritesItems');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (!favoritesContainer) return;

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-heart" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p style="color: #666; text-align: center;">No favorites yet</p>
                <p style="color: #999; text-align: center; font-size: 0.9rem;">
                    Start browsing and add items you love!
                </p>
                <button class="btn btn-primary" onclick="window.location.href='sale.html'" style="margin-top: 1rem;">
                    Browse Products
                </button>
            </div>
        `;
        return;
    }

    favoritesContainer.innerHTML = '';

    // Get product details for favorited items
    const favoriteProducts = getFavoriteProducts(favorites);

    favoriteProducts.forEach(product => {
        if (product) {
            const favoriteItem = createFavoriteItem(product);
            favoritesContainer.appendChild(favoriteItem);
        }
    });
}

function getFavoriteProducts(favoriteIds) {
    // Load products from localStorage (same as main.js)
    let allProducts = [];

    try {
        const storedProducts = localStorage.getItem('vaith_products');
        if (storedProducts) {
            const adminProducts = JSON.parse(storedProducts);
            allProducts = adminProducts.map(product => ({
                id: product.id,
                title: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x500?text=No+Image',
                rating: product.rating || 0,
                reviews: product.reviews || 0,
                category: product.category,
                onSale: product.originalPrice && product.originalPrice > product.price
            }));
        }
    } catch (error) {
        console.error('Error loading products for favorites:', error);
    }

    // Also include hardcoded products for backward compatibility
    const hardcodedProducts = [
        {
            id: 3,
            title: "Denim Jacket",
            price: 59.99,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop&auto=format&q=80",
            rating: 4.7,
            reviews: 203,
            category: "women",
            onSale: false
        },
        {
            id: 5,
            title: "Bohemian Maxi Dress",
            price: 45.99,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&auto=format&q=80",
            rating: 4.6,
            reviews: 92,
            category: "women",
            onSale: false
        }
    ];

    // Combine both product sources
    const combinedProducts = [...allProducts, ...hardcodedProducts];

    return favoriteIds.map(id => combinedProducts.find(product => product.id === id)).filter(Boolean);
}

function createFavoriteItem(product) {
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'favorite-item';
    favoriteItem.style.cssText = `
        display: flex;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
    `;

    const discount = product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    favoriteItem.innerHTML = `
        <div class="favorite-item-image" style="width: 100px; height: 100px; border-radius: 8px; overflow: hidden;">
            <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="favorite-item-info" style="flex: 1;">
            <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${product.title}</h4>
            <div class="favorite-item-price" style="margin-bottom: 0.5rem;">
                <span style="color: #4B0082; font-weight: 600; font-size: 1.1rem;">$${product.price}</span>
                ${product.originalPrice ? `<span style="color: #999; text-decoration: line-through; margin-left: 0.5rem;">$${product.originalPrice}</span>` : ''}
                ${product.onSale && discount > 0 ? `<span style="background: #4B0082; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; margin-left: 0.5rem;">-${discount}%</span>` : ''}
            </div>
            <div class="favorite-item-rating" style="margin-bottom: 1rem;">
                <span style="color: #ffc107;">${generateStars(product.rating)}</span>
                <span style="color: #666; font-size: 0.9rem; margin-left: 0.5rem;">(${product.reviews})</span>
            </div>
            <div class="favorite-item-actions" style="display: flex; gap: 0.5rem;">
                <button class="btn btn-primary add-to-cart-from-favorites" data-product-id="${product.id}" style="padding: 6px 12px; font-size: 0.9rem;">
                    Add to Cart
                </button>
                <button class="remove-from-favorites" data-product-id="${product.id}" style="background: none; border: 1px solid #ddd; color: #666; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                    Remove
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const addToCartBtn = favoriteItem.querySelector('.add-to-cart-from-favorites');
    const removeBtn = favoriteItem.querySelector('.remove-from-favorites');

    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCartFromFavorites(product);
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromFavorites(product.id);
    });

    // Navigate to product page on item click
    favoriteItem.addEventListener('click', () => {
        window.location.href = `product.html?id=${product.id}`;
    });

    return favoriteItem;
}

function addToCartFromFavorites(product) {
    // Use the cart function from cart.js
    if (window.cartFunctions) {
        window.cartFunctions.addToCart(product);
    } else {
        // Fallback if cart.js isn't loaded
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        // Update cart button states if the function exists
        if (typeof updateCartButtons === 'function') {
            updateCartButtons();
        }
        showNotification('Product added to cart!');
    }
}

function removeFromFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));

    updateFavoritesCount();
    // Use the main updateFavoriteButtons function
    if (typeof updateFavoriteButtons === 'function') {
        updateFavoriteButtons();
    }
    renderFavoriteItems();
    showNotification('Removed from favorites');
}

// toggleFavorite function is now handled by main.js to avoid conflicts

function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
}

// updateFavoriteButtons function is now handled by main.js to avoid conflicts

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

// Favorites persistence and sync across tabs
function syncFavoritesAcrossTabs() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'favorites') {
            updateFavoritesCount();
            // Use the main updateFavoriteButtons function
            if (typeof updateFavoriteButtons === 'function') {
                updateFavoriteButtons();
            }
            if (document.getElementById('favoritesModal').classList.contains('open')) {
                renderFavoriteItems();
            }
        }
    });
}

// Clear all favorites
function clearAllFavorites() {
    if (confirm('Are you sure you want to remove all favorites?')) {
        localStorage.removeItem('favorites');
        updateFavoritesCount();
        // Use the main updateFavoriteButtons function
        if (typeof updateFavoriteButtons === 'function') {
            updateFavoriteButtons();
        }
        renderFavoriteItems();
        showNotification('All favorites cleared');
    }
}

// Get favorites for recommendations
function getFavoritesForRecommendations() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteProducts = getFavoriteProducts(favorites);
    
    // Extract categories from favorites for recommendations
    const categories = favoriteProducts.map(product => product.category);
    return [...new Set(categories)]; // Return unique categories
}

// Export favorites functionality
window.favoritesFunctions = {
    removeFromFavorites: removeFromFavorites,
    clearAllFavorites: clearAllFavorites,
    getFavoritesForRecommendations: getFavoritesForRecommendations
};

// Initialize sync functionality
document.addEventListener('DOMContentLoaded', function() {
    syncFavoritesAcrossTabs();
});
