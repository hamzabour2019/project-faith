// Admin Dashboard Functionality

class AdminManager {
    constructor() {
        this.orders = this.loadOrders();
        this.pendingOrders = this.loadPendingOrders();
        this.products = this.loadProducts();
        this.analytics = this.loadAnalytics();
        this.storeStatus = this.loadStoreStatus();
        this.init();
    }

    init() {
        // Initialize demo data if none exists
        if (this.orders.length === 0) {
            this.initializeDemoOrders();
        }
        if (this.pendingOrders.length === 0) {
            this.initializeDemoPendingOrders();
        }
        if (this.products.length === 0) {
            this.initializeDemoProducts();
        }
        if (!this.analytics.lastUpdated) {
            this.initializeDemoAnalytics();
        }
    }

    // Orders Management
    loadOrders() {
        const orders = localStorage.getItem('vaith_orders');
        return orders ? JSON.parse(orders) : [];
    }

    saveOrders() {
        localStorage.setItem('vaith_orders', JSON.stringify(this.orders));
    }

    // Pending Orders Management
    loadPendingOrders() {
        const pendingOrders = localStorage.getItem('vaith_pending_orders');
        return pendingOrders ? JSON.parse(pendingOrders) : [];
    }

    savePendingOrders() {
        localStorage.setItem('vaith_pending_orders', JSON.stringify(this.pendingOrders));
    }

    initializeDemoOrders() {
        // No demo orders - orders will only be created when customers place them
        this.orders = [];
        this.saveOrders();
    }

    initializeDemoPendingOrders() {
        // Create some demo pending orders for testing
        const demoPendingOrders = [
            {
                id: 'ord_001',
                userId: null,
                customerName: 'John Smith',
                customerEmail: 'john.smith@email.com',
                customerPhone: '+1234567890',
                status: 'pending_review',
                total: 89.99,
                items: [
                    {
                        id: 'prod1',
                        name: 'Premium Wireless Headphones',
                        price: 89.99,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
                    }
                ],
                shippingAddress: '123 Main St, Anytown, ST 12345',
                orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                completedDate: null
            },
            {
                id: 'ord_002',
                userId: null,
                customerName: 'Sarah Johnson',
                customerEmail: 'sarah.j@email.com',
                customerPhone: '+1987654321',
                status: 'pending_review',
                total: 149.98,
                items: [
                    {
                        id: 'prod2',
                        name: 'Smart Fitness Watch',
                        price: 149.98,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
                    }
                ],
                shippingAddress: '456 Oak Ave, Another City, ST 67890',
                orderDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                completedDate: null
            }
        ];

        this.pendingOrders = demoPendingOrders;
        this.savePendingOrders();
    }

    // Products Management
    loadProducts() {
        const products = localStorage.getItem('vaith_products');
        return products ? JSON.parse(products) : [];
    }

    saveProducts() {
        localStorage.setItem('vaith_products', JSON.stringify(this.products));
        console.log('AdminManager - Saved', this.products.length, 'products to localStorage'); // Debug log
    }

    refreshProducts() {
        this.products = this.loadProducts();
        console.log('AdminManager - Refreshed products from localStorage, now have', this.products.length, 'products'); // Debug log
        return this.products;
    }

    initializeDemoProducts() {
        // Start with empty products array - no demo data
        this.products = [];
        this.saveProducts();
    }

    // Analytics Management
    loadAnalytics() {
        const analytics = localStorage.getItem('vaith_analytics');
        return analytics ? JSON.parse(analytics) : {};
    }

    saveAnalytics() {
        localStorage.setItem('vaith_analytics', JSON.stringify(this.analytics));
    }

    initializeDemoAnalytics() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        this.analytics = {
            lastUpdated: now.toISOString(),
            revenue: {
                total: 12450.99,
                thisMonth: 3250.50,
                lastMonth: 2890.75,
                growth: 12.4
            },
            orders: {
                total: 156,
                thisMonth: 42,
                lastMonth: 38,
                growth: 10.5
            },
            customers: {
                total: 89,
                new: 12,
                returning: 77,
                growth: 15.2
            },
            products: {
                total: 89,
                active: 85,
                outOfStock: 4,
                lowStock: 8
            },
            topProducts: [
                { id: 1, name: 'Premium T-Shirt', sales: 45, revenue: 2249.55 },
                { id: 2, name: 'Designer Jeans', sales: 23, revenue: 4599.77 }
            ],
            salesByCategory: {
                men: 7200.50,
                women: 5250.49
            },
            monthlyRevenue: [
                { month: 'Jan', revenue: 2890.75 },
                { month: 'Feb', revenue: 3250.50 },
                { month: 'Mar', revenue: 2950.25 },
                { month: 'Apr', revenue: 3359.49 }
            ]
        };

        this.saveAnalytics();
    }

    // Order Methods
    getAllOrders() {
        return this.orders;
    }

    getOrderById(id) {
        return this.orders.find(order => order.id === id);
    }

    createOrder(orderData) {
        // Generate order ID
        const orderId = this.generateOrderId();

        const order = {
            id: orderId,
            userId: orderData.userId || null,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone || '',
            status: 'pending_review', // New status for orders awaiting admin review
            total: orderData.total,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            orderDate: new Date().toISOString(),
            completedDate: null
        };

        // Add to pending orders instead of main orders
        this.pendingOrders.push(order);
        this.savePendingOrders();
        return order;
    }

    generateOrderId() {
        // Get the next sequential order number
        const allOrders = [...this.orders, ...this.pendingOrders];
        let maxOrderNumber = 0;

        // Find the highest existing order number
        allOrders.forEach(order => {
            const match = order.id.match(/^ord_(\d+)$/i);
            if (match) {
                const orderNumber = parseInt(match[1], 10);
                if (orderNumber > maxOrderNumber) {
                    maxOrderNumber = orderNumber;
                }
            }
        });

        // Generate next order number with leading zeros
        const nextOrderNumber = maxOrderNumber + 1;
        return `ord_${nextOrderNumber.toString().padStart(3, '0')}`;
    }

    updateOrderStatus(orderId, status) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = status;

            // Update timestamps based on status
            const now = new Date().toISOString();
            if (status === 'completed' && !this.orders[orderIndex].completedDate) {
                this.orders[orderIndex].completedDate = now;
            }

            this.saveOrders();
            return this.orders[orderIndex];
        }
        return null;
    }

    searchOrders(query) {
        const searchTerm = query.toLowerCase();
        return this.orders.filter(order =>
            order.id.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerEmail.toLowerCase().includes(searchTerm)
        );
    }

    deleteOrder(orderId) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            const deletedOrder = this.orders.splice(orderIndex, 1)[0];
            this.saveOrders();
            return deletedOrder;
        }
        return null;
    }

    filterOrders(filters) {
        let filteredOrders = [...this.orders];

        if (filters.status) {
            filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }

        if (filters.dateFrom) {
            filteredOrders = filteredOrders.filter(order =>
                new Date(order.orderDate) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filteredOrders = filteredOrders.filter(order =>
                new Date(order.orderDate) <= new Date(filters.dateTo)
            );
        }

        return filteredOrders;
    }

    // Pending Orders Methods
    getAllPendingOrders() {
        return this.pendingOrders;
    }

    getPendingOrderById(id) {
        return this.pendingOrders.find(order => order.id === id);
    }

    approvePendingOrder(orderId, newStatus = 'pending') {
        const orderIndex = this.pendingOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            const order = this.pendingOrders[orderIndex];

            // Update order status and add approval timestamp
            order.status = newStatus;
            order.approvedDate = new Date().toISOString();

            // Move from pending to main orders
            this.orders.push(order);
            this.pendingOrders.splice(orderIndex, 1);

            // Save both arrays
            this.saveOrders();
            this.savePendingOrders();

            return order;
        }
        return null;
    }

    rejectPendingOrder(orderId, reason = '') {
        const orderIndex = this.pendingOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            const order = this.pendingOrders[orderIndex];

            // Update order status and add rejection info
            order.status = 'rejected';
            order.rejectedDate = new Date().toISOString();
            order.rejectionReason = reason;

            // Keep in pending orders but mark as rejected
            this.savePendingOrders();

            return order;
        }
        return null;
    }

    searchPendingOrders(query) {
        const searchTerm = query.toLowerCase();
        return this.pendingOrders.filter(order =>
            order.id.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerEmail.toLowerCase().includes(searchTerm)
        );
    }

    deletePendingOrder(orderId) {
        const orderIndex = this.pendingOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            const deletedOrder = this.pendingOrders.splice(orderIndex, 1)[0];
            this.savePendingOrders();
            return deletedOrder;
        }
        return null;
    }

    // Product Methods
    getAllProducts() {
        console.log('AdminManager - getAllProducts called, returning', this.products.length, 'products'); // Debug log
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    addProduct(productData) {
        // Generate ID if not provided
        if (!productData.id) {
            productData.id = Date.now();
        }

        // Set default values
        const product = {
            id: productData.id,
            name: productData.name,
            brand: productData.brand || 'TheProjectFaith',
            description: productData.description || '',
            category: productData.category,
            status: productData.status || 'active',
            sku: productData.sku || this.generateSKU(),
            price: parseFloat(productData.price),
            originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
            stock: parseInt(productData.stock) || 0,
            images: productData.images || ['https://via.placeholder.com/400x500?text=No+Image'],
            sizes: productData.sizes || ['One Size'],
            colors: productData.colors || ['Default'],
            rating: productData.rating || 0,
            reviews: productData.reviews || 0,
            showOnHomepage: productData.showOnHomepage || false,
            showOnProducts: productData.showOnProducts !== undefined ? productData.showOnProducts : true,
            showOnSale: productData.showOnSale || false,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
        };

        this.products.push(product);
        this.saveProducts();
        return product;
    }

    generateSKU() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `SKU-${random}${timestamp}`;
    }

    updateProduct(productId, updates) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.products[productIndex] = {
                ...this.products[productIndex],
                ...updates,
                updatedDate: new Date().toISOString()
            };
            this.saveProducts();
            return this.products[productIndex];
        }
        return null;
    }

    deleteProduct(productId) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            this.saveProducts();
            return true;
        }
        return false;
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm)
        );
    }

    filterProducts(filters) {
        let filteredProducts = [...this.products];

        if (filters.category) {
            filteredProducts = filteredProducts.filter(product => product.category === filters.category);
        }

        if (filters.status) {
            filteredProducts = filteredProducts.filter(product => product.status === filters.status);
        }

        if (filters.priceMin) {
            filteredProducts = filteredProducts.filter(product => product.price >= parseFloat(filters.priceMin));
        }

        if (filters.priceMax) {
            filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(filters.priceMax));
        }

        return filteredProducts;
    }

    // Analytics Methods
    getAnalytics() {
        return this.analytics;
    }

    getDashboardStats() {
        const userStats = authManager.getUserStats();
        const orderStats = this.getOrderStats();
        const productStats = this.getProductStats();
        
        return {
            users: userStats,
            orders: orderStats,
            products: productStats,
            revenue: this.analytics.revenue
        };
    }

    getOrderStats() {
        const total = this.orders.length;
        const completed = this.orders.filter(o => o.status === 'completed').length;
        const pending = this.orders.filter(o => o.status === 'pending').length;
        const cancelled = this.orders.filter(o => o.status === 'cancelled').length;
        const pendingReview = this.pendingOrders.filter(o => o.status === 'pending_review').length;

        return {
            total,
            completed,
            pending,
            cancelled,
            pendingReview,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    getProductStats() {
        const total = this.products.length;
        const active = this.products.filter(p => p.status === 'active').length;
        const outOfStock = this.products.filter(p => p.stock === 0).length;
        const lowStock = this.products.filter(p => p.stock > 0 && p.stock <= 5).length;

        console.log('AdminManager - Product stats:', { total, active, outOfStock, lowStock }); // Debug log

        return {
            total,
            active,
            outOfStock,
            lowStock,
            activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
        };
    }

    // Store Status Management
    loadStoreStatus() {
        const status = localStorage.getItem('theprojectfaith_store_status');
        return status ? JSON.parse(status) : {
            isOpen: true,
            lastUpdated: new Date().toISOString(),
            updatedBy: null,
            reason: null
        };
    }

    saveStoreStatus() {
        localStorage.setItem('theprojectfaith_store_status', JSON.stringify(this.storeStatus));
    }

    getStoreStatus() {
        return this.storeStatus;
    }

    isStoreOpen() {
        return this.storeStatus.isOpen;
    }

    openStore(adminUser, reason = null) {
        this.storeStatus = {
            isOpen: true,
            lastUpdated: new Date().toISOString(),
            updatedBy: adminUser ? adminUser.email : 'admin',
            reason: reason
        };
        this.saveStoreStatus();

        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'theprojectfaith_store_status',
            newValue: JSON.stringify(this.storeStatus)
        }));

        return this.storeStatus;
    }

    closeStore(adminUser, reason = 'Store temporarily closed for maintenance') {
        this.storeStatus = {
            isOpen: false,
            lastUpdated: new Date().toISOString(),
            updatedBy: adminUser ? adminUser.email : 'admin',
            reason: reason
        };
        this.saveStoreStatus();

        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'theprojectfaith_store_status',
            newValue: JSON.stringify(this.storeStatus)
        }));

        return this.storeStatus;
    }

    toggleStoreStatus(adminUser, reason = null) {
        if (this.storeStatus.isOpen) {
            return this.closeStore(adminUser, reason || 'Store temporarily closed');
        } else {
            return this.openStore(adminUser, reason || 'Store reopened');
        }
    }
}

// Initialize global admin manager
window.adminManager = new AdminManager();

// Utility functions for admin UI
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

function getOrderStatusBadgeClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'pending_review': 'status-suspended',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled',
        'rejected': 'status-cancelled'
    };
    return statusClasses[status] || 'status-inactive';
}

function getProductStatusBadgeClass(status) {
    const statusClasses = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'draft': 'status-pending',
        'archived': 'status-suspended'
    };
    return statusClasses[status] || 'status-inactive';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminManager, formatCurrency, formatNumber, getOrderStatusBadgeClass, getProductStatusBadgeClass };
}
