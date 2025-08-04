// API Configuration and Helper Functions
class APIClient {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get authentication headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication APIs
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            auth: false
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setToken(null);
        }
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    async verifyToken() {
        return await this.request('/auth/verify-token', { method: 'POST' });
    }

    // Product APIs
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/products${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint, { auth: false });
    }

    async getProduct(id) {
        return await this.request(`/products/${id}`, { auth: false });
    }

    async getFeaturedProducts() {
        return await this.request('/products/featured', { auth: false });
    }

    async getProductCategories() {
        return await this.request('/products/categories', { auth: false });
    }

    async getRelatedProducts(id) {
        return await this.request(`/products/${id}/related`, { auth: false });
    }

    async createProduct(productData) {
        return await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return await this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return await this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    async addProductReview(productId, rating, comment) {
        return await this.request(`/products/${productId}/reviews`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment })
        });
    }

    // Order APIs
    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/orders${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async getOrder(id) {
        return await this.request(`/orders/${id}`);
    }

    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
            auth: false // Allow guest orders
        });
    }

    async updateOrderStatus(id, status, note = '') {
        return await this.request(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, note })
        });
    }

    async cancelOrder(id, reason = '') {
        return await this.request(`/orders/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    async trackOrder(orderNumber) {
        return await this.request(`/orders/track/${orderNumber}`, { auth: false });
    }

    async getOrderStats() {
        return await this.request('/orders/stats');
    }

    // User APIs
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/users${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async updateUser(id, userData) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    async getUserOrders(id, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/users/${id}/orders${queryString ? '?' + queryString : ''}`;
        return await this.request(endpoint);
    }

    async updateUserStatus(id, status) {
        return await this.request(`/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async getUserStats() {
        return await this.request('/users/stats');
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    async checkHealth() {
        return await this.request('/health', { auth: false });
    }
}

// Create global API client instance
const api = new APIClient();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api };
}
