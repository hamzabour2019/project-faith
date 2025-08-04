// Common Admin Interface Functionality
// Shared functions for sidebar, navigation, and accessibility

class AdminInterface {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.setupSidebarToggle();
        this.setupUserMenu();
        this.setupKeyboardNavigation();
        this.setupResponsiveHandling();
        this.setupAccessibility();
    }

    setupSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (!sidebarToggle) return;

        sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Close sidebar when clicking overlay (mobile)
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const main = document.getElementById('adminMain');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (!sidebar) return;

        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile) {
            // Mobile behavior: toggle mobile-open class and overlay
            const isOpen = sidebar.classList.contains('mobile-open');
            
            if (isOpen) {
                this.closeMobileSidebar();
            } else {
                this.openMobileSidebar();
            }
        } else {
            // Desktop behavior: toggle collapsed class
            sidebar.classList.toggle('collapsed');
            if (main) main.classList.toggle('expanded');
            
            const isCollapsed = sidebar.classList.contains('collapsed');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', !isCollapsed);
            }
        }
    }

    openMobileSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (sidebar) {
            sidebar.classList.add('mobile-open');
            sidebar.setAttribute('aria-hidden', 'false');
        }
        
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
        
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden';
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            sidebar.setAttribute('aria-hidden', 'true');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
        
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        // Restore body scroll
        document.body.style.overflow = '';
    }

    setupUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (!userMenuBtn || !userDropdown) return;

        // User menu toggle with improved accessibility
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserMenu();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeUserMenu();
        });
    }

    toggleUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (!userMenuBtn || !userDropdown) return;

        const isOpen = userDropdown.classList.contains('show');
        
        if (isOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }

    openUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (!userMenuBtn || !userDropdown) return;

        userDropdown.classList.add('show');
        userMenuBtn.setAttribute('aria-expanded', 'true');
        userDropdown.setAttribute('aria-hidden', 'false');

        // Focus first item when opening
        const firstItem = userDropdown.querySelector('.dropdown-item');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
        }
    }

    closeUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (!userMenuBtn || !userDropdown) return;

        userDropdown.classList.remove('show');
        userMenuBtn.setAttribute('aria-expanded', 'false');
        userDropdown.setAttribute('aria-hidden', 'true');
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    handleEscapeKey() {
        const sidebar = document.getElementById('adminSidebar');
        const userDropdown = document.getElementById('userDropdown');

        // Close mobile sidebar if open
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            this.closeMobileSidebar();
            const toggleBtn = document.getElementById('sidebarToggle');
            if (toggleBtn) toggleBtn.focus();
            return;
        }

        // Close user menu if open
        if (userDropdown && userDropdown.classList.contains('show')) {
            this.closeUserMenu();
            const userMenuBtn = document.getElementById('userMenuBtn');
            if (userMenuBtn) userMenuBtn.focus();
            return;
        }
    }

    setupResponsiveHandling() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // If switching from mobile to desktop, reset mobile states
        if (wasMobile && !this.isMobile) {
            this.closeMobileSidebar();
            
            const sidebar = document.getElementById('adminSidebar');
            if (sidebar) {
                sidebar.setAttribute('aria-hidden', 'false');
            }
        }
    }

    setupAccessibility() {
        // Initialize ARIA attributes
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const userDropdown = document.getElementById('userDropdown');
        const userMenuBtn = document.getElementById('userMenuBtn');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (sidebar) {
            sidebar.setAttribute('aria-hidden', this.isMobile ? 'true' : 'false');
        }

        if (overlay) {
            overlay.setAttribute('aria-hidden', 'true');
        }

        if (userDropdown) {
            userDropdown.setAttribute('aria-hidden', 'true');
        }

        if (userMenuBtn) {
            userMenuBtn.setAttribute('aria-expanded', 'false');
        }

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    // Utility method to show toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = this.getOrCreateToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">
                    ${type === 'success' ? '✅ Success' :
                      type === 'error' ? '❌ Error' :
                      type === 'warning' ? '⚠️ Warning' :
                      '💡 Info'}
                </div>
                <button class="toast-close" onclick="adminInterface.removeToast(this.parentElement.parentElement)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    getOrCreateToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    removeToast(toast) {
        if (toast && toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }
    }
}

// Initialize admin interface when DOM is loaded
let adminInterface;
document.addEventListener('DOMContentLoaded', function() {
    adminInterface = new AdminInterface();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminInterface;
}
