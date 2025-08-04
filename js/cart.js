// Shopping Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
});

function initializeCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');

    // Open cart modal
    cartBtn?.addEventListener('click', function() {
        cartModal.classList.add('open');
        overlay.classList.add('active');
        renderCartItems();
    });

    // Close cart modal
    closeCartBtn?.addEventListener('click', function() {
        cartModal.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Close cart when clicking overlay
    overlay?.addEventListener('click', function() {
        cartModal.classList.remove('open');
        overlay.classList.remove('active');
    });

    // Initial cart render
    renderCartItems();
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p style="color: #666; text-align: center;">Your cart is empty</p>
                <button class="btn btn-primary" onclick="window.location.href='sale.html'" style="margin-top: 1rem;">
                    Start Shopping
                </button>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItem = createCartItem(item);
        cartItemsContainer.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    if (cartTotal) {
        cartTotal.textContent = total.toFixed(2);
    }
}

function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.setAttribute('data-item-id', item.id);

    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">$${item.price}</div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease-btn" data-item-id="${item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity" value="${item.quantity}" min="1" data-item-id="${item.id}">
                <button class="quantity-btn increase-btn" data-item-id="${item.id}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-item" data-item-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const decreaseBtn = cartItem.querySelector('.decrease-btn');
    const increaseBtn = cartItem.querySelector('.increase-btn');
    const quantityInput = cartItem.querySelector('.quantity');
    const removeBtn = cartItem.querySelector('.remove-item');

    decreaseBtn.addEventListener('click', () => updateQuantity(item.id, -1));
    increaseBtn.addEventListener('click', () => updateQuantity(item.id, 1));
    removeBtn.addEventListener('click', () => removeFromCart(item.id));

    quantityInput.addEventListener('change', (e) => {
        const newQuantity = parseInt(e.target.value);
        if (newQuantity > 0) {
            setQuantity(item.id, newQuantity);
        } else {
            e.target.value = item.quantity;
        }
    });

    return cartItem;
}

function updateQuantity(itemId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === itemId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
        // Update cart button states if the function exists
        if (typeof updateCartButtons === 'function') {
            updateCartButtons();
        }
    }
}

function setQuantity(itemId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === itemId);

    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }
}

function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
    // Update cart button states if the function exists
    if (typeof updateCartButtons === 'function') {
        updateCartButtons();
    }
    showNotification('Item removed from cart');
}

function clearCart() {
    localStorage.removeItem('cart');
    renderCartItems();
    updateCartCount();
    // Update cart button states if the function exists
    if (typeof updateCartButtons === 'function') {
        updateCartButtons();
    }
    showNotification('Cart cleared');
}

// Checkout functionality
function initializeCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    checkoutBtn?.addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            showNotification('Your cart is empty');
            return;
        }

        // Redirect directly to checkout page
        showNotification('Redirecting to checkout...');

        // Redirect to checkout page
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1000);
    });
}

// Cart persistence and sync across tabs
function syncCartAcrossTabs() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            renderCartItems();
            updateCartCount();
        }
    });
}

// Cart analytics (for tracking user behavior)
function trackCartEvent(action, itemId, quantity = 1) {
    // In a real application, this would send data to analytics service
    // Analytics tracking would be implemented here
}

// Save for later functionality
function saveForLater(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let savedItems = JSON.parse(localStorage.getItem('savedForLater')) || [];
    
    const item = cart.find(item => item.id === itemId);
    if (item) {
        // Remove from cart
        cart = cart.filter(item => item.id !== itemId);
        
        // Add to saved items
        savedItems.push(item);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('savedForLater', JSON.stringify(savedItems));
        
        renderCartItems();
        updateCartCount();
        showNotification('Item saved for later');
    }
}

function moveToCart(itemId) {
    let savedItems = JSON.parse(localStorage.getItem('savedForLater')) || [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const item = savedItems.find(item => item.id === itemId);
    if (item) {
        // Remove from saved items
        savedItems = savedItems.filter(item => item.id !== itemId);
        
        // Add to cart
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        
        localStorage.setItem('savedForLater', JSON.stringify(savedItems));
        localStorage.setItem('cart', JSON.stringify(cart));
        
        renderCartItems();
        updateCartCount();
        showNotification('Item moved to cart');
    }
}

// Cart recommendations
function getCartRecommendations() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) return [];
    
    // In a real app, this would make an API call based on cart contents
    // For demo, return some sample recommendations
    return [
        {
            id: 101,
            title: "Recommended Item 1",
            price: 19.99,
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop"
        },
        {
            id: 102,
            title: "Recommended Item 2",
            price: 24.99,
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop"
        }
    ];
}

// Promo code functionality
function applyPromoCode(code) {
    const validCodes = {
        'SAVE10': 0.1,
        'WELCOME20': 0.2,
        'SUMMER15': 0.15
    };
    
    const discount = validCodes[code.toUpperCase()];
    
    if (discount) {
        localStorage.setItem('promoCode', JSON.stringify({
            code: code.toUpperCase(),
            discount: discount
        }));
        renderCartItems();
        showNotification(`Promo code applied! ${(discount * 100)}% off`);
        return true;
    } else {
        showNotification('Invalid promo code');
        return false;
    }
}

function removePromoCode() {
    localStorage.removeItem('promoCode');
    renderCartItems();
    showNotification('Promo code removed');
}

// Initialize all cart functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    syncCartAcrossTabs();
});

// Export functions for use in other files
window.cartFunctions = {
    addToCart: function(product) {
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
        trackCartEvent('add', product.id);
        showNotification('Product added to cart!');
    },
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    updateQuantity: updateQuantity
};
