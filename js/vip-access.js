// VIP Access Control System
class VIPAccessControl {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="vip-access-modal" id="vipAccessModal">
                <div class="vip-access-content">
                    <div class="vip-access-header">
                        <div class="vip-crown"></div>
                        <h2 class="vip-access-title">VIP Access Required</h2>
                        <p class="vip-access-subtitle">Exclusive Sale for VIP Members Only</p>
                    </div>
                    <div class="vip-access-body">
                        <p class="vip-access-message">
                            Our exclusive sale section is reserved for VIP members only. 
                            Upgrade to VIP to unlock amazing deals, early access to new products, 
                            and exclusive member-only discounts!
                        </p>
                        
                        <div class="vip-benefits">
                            <h4>VIP Member Benefits:</h4>
                            <ul class="vip-benefits-list">
                                <li>Exclusive access to sale events</li>
                                <li>Up to 50% off on premium products</li>
                                <li>Early access to new arrivals</li>
                                <li>Priority customer support</li>
                                <li>Free shipping on all orders</li>
                                <li>Special birthday discounts</li>
                            </ul>
                        </div>
                        
                        <div class="vip-access-actions">
                            <button class="vip-upgrade-btn" id="upgradeToVipBtn">
                                <i class="fas fa-crown"></i> Upgrade to VIP
                            </button>
                            <button class="vip-back-btn" id="backToHomeBtn">
                                <i class="fas fa-arrow-left"></i> Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('vipAccessModal');
    }

    setupEventListeners() {
        const upgradeBtn = document.getElementById('upgradeToVipBtn');
        const backBtn = document.getElementById('backToHomeBtn');

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.handleUpgrade());
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleBack());
        }

        // Close modal on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.handleBack();
                }
            });
        }

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.handleBack();
            }
        });
    }

    showModal() {
        if (this.modal) {
            this.modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            const upgradeBtn = document.getElementById('upgradeToVipBtn');
            if (upgradeBtn) {
                setTimeout(() => upgradeBtn.focus(), 300);
            }
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    isModalOpen() {
        return this.modal && this.modal.classList.contains('open');
    }

    handleUpgrade() {
        // For demo purposes, we'll show a notification
        // In a real app, this would redirect to a payment/upgrade page
        this.showUpgradeNotification();
    }

    handleBack() {
        this.hideModal();
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }

    showUpgradeNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4B0082, #8A2BE2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(75, 0, 130, 0.3);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            Request more order to be able to upgrade.
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Check if user has VIP access
    static checkVIPAccess() {
        if (typeof authManager === 'undefined') {
            return false;
        }

        return authManager.requireVIP();
    }

    // Get user access level for display purposes
    static getUserAccessLevel() {
        if (typeof authManager === 'undefined') {
            return 'guest';
        }

        return authManager.getAccessLevel();
    }

    // Main function to handle sale page access
    static handleSalePageAccess() {
        const accessLevel = VIPAccessControl.getUserAccessLevel();

        console.log('VIP Access Check - User Level:', accessLevel); // Debug log

        if (accessLevel === 'vip' || accessLevel === 'admin') {
            // User has VIP access, show the sale content
            console.log('VIP Access GRANTED'); // Debug log
            VIPAccessControl.showVIPContent();
            return true;
        } else {
            // User doesn't have VIP access, show restriction modal
            console.log('VIP Access DENIED - Showing restriction modal'); // Debug log
            const vipControl = new VIPAccessControl();
            vipControl.showModal();
            VIPAccessControl.hideMainContent();
            return false;
        }
    }

    static showVIPContent() {
        // Show VIP special styling only (no badges or messages)
        const body = document.body;
        body.classList.add('vip-access-granted');

        // Add VIP user greeting (keep this for personalization)
        VIPAccessControl.addVIPGreeting();
    }

    static hideMainContent() {
        // Hide the main sale content
        const mainContent = document.querySelector('main');
        const saleSection = document.querySelector('.sale-section');

        if (mainContent) {
            mainContent.style.display = 'none';
        }

        if (saleSection) {
            saleSection.style.display = 'none';
        }
    }

    static addVIPGreeting() {
        // Greeting disabled - no welcome message will be shown
        return;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only run on sale page
    if (window.location.pathname.includes('sale.html')) {
        // Wait a bit for auth manager to initialize
        setTimeout(() => {
            VIPAccessControl.handleSalePageAccess();
        }, 100);
    }
});

// Export for use in other scripts
window.VIPAccessControl = VIPAccessControl;
