// Store Status Management
// This script checks if the store is open and redirects to login if closed

class StoreStatusChecker {
    constructor() {
        this.init();
    }

    init() {
        // Check store status immediately
        this.checkStoreStatus();
        
        // Listen for storage changes (when admin changes store status)
        window.addEventListener('storage', (e) => {
            if (e.key === 'theprojectfaith_store_status') {
                this.checkStoreStatus();
            }
        });
    }

    getStoreStatus() {
        const status = localStorage.getItem('theprojectfaith_store_status');
        return status ? JSON.parse(status) : {
            isOpen: true,
            lastUpdated: new Date().toISOString(),
            updatedBy: null,
            reason: null
        };
    }

    isStoreOpen() {
        return this.getStoreStatus().isOpen;
    }

    checkStoreStatus() {
        // Don't check on admin pages or login/signup pages
        const currentPage = window.location.pathname;
        const adminPages = [
            '/admin-dashboard.html',
            '/admin-users.html', 
            '/admin-products.html',
            '/admin-orders.html'
        ];
        
        const authPages = [
            '/login.html',
            '/signup.html'
        ];

        // Skip check for admin and auth pages
        if (adminPages.some(page => currentPage.includes(page)) || 
            authPages.some(page => currentPage.includes(page))) {
            return;
        }

        // Check if store is closed
        if (!this.isStoreOpen()) {
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        const status = this.getStoreStatus();
        const reason = status.reason || 'Store is temporarily closed';
        
        // Store the intended destination
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        
        // Add store closed message to session storage
        sessionStorage.setItem('storeClosedMessage', reason);
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    showStoreClosedMessage() {
        const message = sessionStorage.getItem('storeClosedMessage');
        if (message) {
            // Clear the message
            sessionStorage.removeItem('storeClosedMessage');
            
            // Show the message on login page
            this.displayStoreClosedNotification(message);
        }
    }

    displayStoreClosedNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'store-closed-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-store-slash"></i>
                <div>
                    <h4>Store Temporarily Closed</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .store-closed-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #f59e0b;
                border-radius: 0.75rem;
                padding: 1rem 1.5rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                max-width: 500px;
                width: 90%;
                animation: slideDown 0.3s ease-out;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .store-closed-notification i {
                font-size: 1.5rem;
                color: #d97706;
            }

            .store-closed-notification h4 {
                margin: 0 0 0.25rem 0;
                color: #92400e;
                font-size: 1rem;
                font-weight: 600;
            }

            .store-closed-notification p {
                margin: 0;
                color: #a16207;
                font-size: 0.875rem;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;

        // Add to page
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize store status checker
let storeStatusChecker;
document.addEventListener('DOMContentLoaded', function() {
    storeStatusChecker = new StoreStatusChecker();
    
    // Show store closed message on login page if redirected
    if (window.location.pathname.includes('login.html')) {
        storeStatusChecker.showStoreClosedMessage();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoreStatusChecker;
}
