// Authentication and Authorization System

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check if user is logged in by verifying token
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await api.verifyToken();
                if (response.success) {
                    this.currentUser = response.data.user;
                    this.saveCurrentUser();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                this.logout();
            }
        }
    }

    // Save current user to localStorage
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // Login method using API
    async login(email, password) {
        try {
            const response = await api.login(email, password);
            if (response.success) {
                this.currentUser = response.data.user;
                this.saveCurrentUser();
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, error: response.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    }

    // Register method using API
    async register(userData) {
        try {
            const response = await api.register(userData);
            if (response.success) {
                this.currentUser = response.data.user;
                this.saveCurrentUser();
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, error: response.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    }

    // Logout method
    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.saveCurrentUser();
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser && !!localStorage.getItem('authToken');
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is VIP
    isVIP() {
        return this.currentUser && this.currentUser.role === 'vip';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update user profile
    async updateProfile(userData) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const response = await api.updateUser(this.currentUser._id, userData);
            if (response.success) {
                this.currentUser = { ...this.currentUser, ...response.data };
                this.saveCurrentUser();
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, error: response.error || 'Update failed' };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message || 'Update failed' };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.request('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            return response;
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: error.message || 'Password change failed' };
        }
    }

    // Legacy methods for backward compatibility (now removed)
    initializeDemoUsers() {
        // No longer needed - users are managed by the backend
        console.log('Demo users are now managed by the backend database');
    }

    loadUsers() {
        // No longer needed - users are loaded from backend
        return [];
    }

    saveUsers() {
        // No longer needed - users are saved to backend
    }

    findUserByEmail(email) {
        // This method is now handled by the backend
        console.warn('findUserByEmail is deprecated - use backend API instead');
        return null;
    }

    validateUser(email, password) {
        // This method is now handled by the backend
        console.warn('validateUser is deprecated - use login method instead');
        return null;
    }

    createUser(userData) {
        // This method is now handled by the backend
        console.warn('createUser is deprecated - use register method instead');
        return null;
    }

    updateUser(userId, userData) {
        // This method is now handled by the backend
        console.warn('updateUser is deprecated - use updateProfile method instead');
        return null;
    }

    deleteUser(userId) {
        // This method is now handled by the backend
        console.warn('deleteUser is deprecated - use backend API instead');
        return null;
    }

    getUserById(userId) {
        // This method is now handled by the backend
        console.warn('getUserById is deprecated - use backend API instead');
        return null;
    }

    getAllUsers() {
        // This method is now handled by the backend
        console.warn('getAllUsers is deprecated - use backend API instead');
        return [];
    }

    getUserStats() {
        // This method is now handled by the backend
        console.warn('getUserStats is deprecated - use backend API instead');
        return {};
    }

    // Legacy compatibility method
    async signup(userData) {
        return await this.register(userData);
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await authManager.init();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, authManager };
}
