// Enhanced Theme Toggle Implementation
console.log('🌙 Theme toggle script loaded');

// Global theme state
window.themeToggleState = {
    initialized: false,
    currentTheme: 'light'
};

// Initialize theme immediately (before DOM loads)
(function() {
    console.log('🚀 Early theme initialization starting...');

    // Check for saved theme preference or default to system preference
    let savedTheme = localStorage.getItem('theme');

    // If no saved preference, check system preference
    if (!savedTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            savedTheme = 'dark';
        } else {
            savedTheme = 'light';
        }
        // Save the detected preference
        localStorage.setItem('theme', savedTheme);
    }

    console.log('🎨 Initializing theme:', savedTheme);
    window.themeToggleState.currentTheme = savedTheme;

    // Apply theme immediately to prevent flash
    applyThemeImmediate(savedTheme);

    console.log('✅ Early theme initialization complete');
})();

// Immediate theme application function (before DOM is ready)
function applyThemeImmediate(theme) {
    console.log('⚡ Applying theme immediately:', theme);

    // Set data attribute
    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        // Apply critical dark theme variables immediately
        const criticalVars = {
            '--background-color': '#0f0f0f',
            '--text-color': '#e4e4e7',
            '--card-bg': '#18181b',
            '--border-color': '#27272a'
        };

        Object.entries(criticalVars).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });
    } else {
        document.body.classList.remove('dark-theme');
        // Remove dark theme overrides to let CSS take over
        const propsToRemove = [
            '--background-color', '--text-color', '--card-bg', '--border-color'
        ];

        propsToRemove.forEach(prop => {
            document.documentElement.style.removeProperty(prop);
        });
    }
}

// Wait for DOM to be ready with retry mechanism
function initializeThemeToggle() {
    console.log('🚀 DOM ready, setting up theme toggle');

    // Prevent double initialization
    if (window.themeToggleState.initialized) {
        console.log('⚠️ Theme toggle already initialized, skipping...');
        return;
    }

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    console.log('🔍 Found elements:', {
        themeToggle: !!themeToggle,
        themeIcon: !!themeIcon,
        toggleId: themeToggle?.id,
        iconId: themeIcon?.id
    });

    if (!themeToggle || !themeIcon) {
        console.error('❌ Theme toggle elements not found!');
        // Try alternative selectors
        const altToggle = document.querySelector('.theme-toggle');
        const altIcon = document.querySelector('.theme-toggle i');

        if (altToggle && altIcon) {
            console.log('🔄 Found elements with alternative selectors');
            setupThemeToggle(altToggle, altIcon);
        } else {
            console.error('❌ Could not find theme toggle elements with any selector');
            return;
        }
    } else {
        setupThemeToggle(themeToggle, themeIcon);
    }
}

function setupThemeToggle(toggleElement, iconElement) {
    console.log('⚙️ Setting up theme toggle functionality');

    // Check if this specific element is already set up
    if (toggleElement.hasAttribute('data-theme-toggle-initialized')) {
        console.log('⚠️ This theme toggle element is already initialized, skipping...');
        return;
    }

    // Mark as initialized
    window.themeToggleState.initialized = true;
    toggleElement.setAttribute('data-theme-toggle-initialized', 'true');

    // Set initial icon based on current theme
    const currentTheme = window.themeToggleState.currentTheme;
    updateIcon(currentTheme, toggleElement, iconElement);

    // Create the click handler with debouncing to prevent double-firing
    let isToggling = false;
    const handleThemeToggle = function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Prevent double-firing on mobile devices
        if (isToggling) {
            console.log('🚫 Theme toggle already in progress, ignoring');
            return;
        }

        isToggling = true;
        console.log('🖱️ Theme toggle clicked!');

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        console.log('🔄 Switching from', currentTheme, 'to', newTheme);

        // Apply new theme
        applyTheme(newTheme);

        // Update global state
        window.themeToggleState.currentTheme = newTheme;

        // Save to localStorage
        localStorage.setItem('theme', newTheme);

        // Track manual theme change to prevent auto-switching for a while
        localStorage.setItem('lastManualThemeChange', Date.now().toString());

        // Update icon
        updateIcon(newTheme, toggleElement, iconElement);

        // Visual feedback
        toggleElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            toggleElement.style.transform = '';
        }, 150);

        console.log('✅ Theme switched to:', newTheme);

        // Reset the toggle flag after a short delay
        setTimeout(() => {
            isToggling = false;
        }, 300);
    };

    // Remove any existing listeners to prevent duplicates
    toggleElement.removeEventListener('click', handleThemeToggle);
    toggleElement.removeEventListener('touchstart', handleThemeToggle);
    toggleElement.removeEventListener('touchend', handleThemeToggle);

    // Detect if device supports touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        // For touch devices, use touchend to avoid conflicts with click
        toggleElement.addEventListener('touchend', handleThemeToggle, { passive: false });
    } else {
        // For non-touch devices, use click
        toggleElement.addEventListener('click', handleThemeToggle);
    }

    // Add keyboard support
    toggleElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            handleThemeToggle(e);
        }
    });

    console.log('✅ Theme toggle setup complete');

    // Setup system theme change listener
    setupSystemThemeListener();
}

function setupSystemThemeListener() {
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function(e) {
            // Only auto-switch if user hasn't manually set a preference recently
            const lastManualChange = localStorage.getItem('lastManualThemeChange');
            const now = Date.now();
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

            if (!lastManualChange || (now - parseInt(lastManualChange)) > oneHour) {
                const systemTheme = e.matches ? 'dark' : 'light';
                console.log('🔄 System theme changed to:', systemTheme);
                applyTheme(systemTheme);
                localStorage.setItem('theme', systemTheme);
                window.themeToggleState.currentTheme = systemTheme;

                // Update icon if elements exist
                const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
                const themeIcon = document.getElementById('themeIcon') || document.querySelector('.theme-toggle i');
                if (themeToggle && themeIcon) {
                    updateIcon(systemTheme, themeToggle, themeIcon);
                }
            }
        });
    }
}

// Initialize when DOM is ready (only once)
if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', initializeThemeToggle);
} else {
    // DOM is already loaded
    setTimeout(initializeThemeToggle, 100);
}

function applyTheme(theme) {
    console.log('🎨 Applying theme:', theme);

    // Validate theme parameter
    if (theme !== 'light' && theme !== 'dark') {
        console.warn('⚠️ Invalid theme:', theme, 'defaulting to light');
        theme = 'light';
    }

    // Set data attribute
    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');

        // Apply dark theme variables - let CSS handle most of it, only override critical ones
        const darkVars = {
            '--background-color': '#0f0f0f',
            '--text-color': '#e4e4e7',
            '--text-light': '#a1a1aa',
            '--border-color': '#27272a',
            '--card-bg': '#18181b',
            '--card-border': '#27272a',
            '--input-bg': '#18181b',
            '--input-border': '#3f3f46',
            '--modal-bg': '#18181b',
            '--modal-overlay': 'rgba(0, 0, 0, 0.8)',
            '--navbar-bg': 'rgba(24, 24, 27, 0.95)',
            '--navbar-border': 'rgba(63, 63, 70, 0.3)',
            '--section-bg': '#09090b',
            '--footer-bg': '#18181b',
            '--footer-text': '#e4e4e7',
            '--success-color': '#10b981',
            '--warning-color': '#f59e0b',
            '--error-color': '#ef4444',
            '--link-color': '#8b5cf6',
            '--link-hover-color': '#a78bfa',
            // Admin-specific dark theme variables
            '--admin-primary': '#8b5cf6',
            '--admin-primary-hover': '#7c3aed',
            '--admin-primary-rgb': '139, 92, 246',
            '--admin-border': '#27272a',
            '--admin-border-radius': '8px',
            '--admin-bg-secondary': '#18181b',
            '--admin-text-primary': '#e4e4e7',
            '--admin-text-secondary': '#a1a1aa',
            '--admin-text-tertiary': '#71717a',
            '--admin-card-bg': '#18181b',
            '--admin-input-bg': '#09090b',
            '--admin-section-bg': '#09090b',
            '--admin-hover-bg': '#27272a',
            '--admin-surface-hover': '#27272a',
            '--admin-success': '#10b981',
            '--star-color': '#fbbf24'
        };

        // Apply all dark theme variables
        Object.entries(darkVars).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });

    } else {
        document.body.classList.remove('dark-theme');

        // For light theme, remove overrides and let CSS take control
        const lightVars = {
            '--background-color': '#FFFFFF',
            '--text-color': '#333',
            '--text-light': '#666',
            '--border-color': '#e1e5e9',
            '--card-bg': '#ffffff',
            '--card-border': '#e1e5e9',
            '--input-bg': '#ffffff',
            '--input-border': '#e1e5e9',
            '--modal-bg': '#ffffff',
            '--modal-overlay': 'rgba(0, 0, 0, 0.5)',
            '--navbar-bg': 'rgba(255, 255, 255, 0.95)',
            '--navbar-border': 'rgba(255, 255, 255, 0.3)',
            '--section-bg': '#f8f9fa',
            '--footer-bg': '#2c3e50',
            '--footer-text': '#ecf0f1',
            '--success-color': '#27ae60',
            '--warning-color': '#ffc107',
            '--error-color': '#e74c3c',
            // Admin-specific light theme variables
            '--admin-primary': '#8b4513',
            '--admin-primary-hover': '#7a3e0f',
            '--admin-primary-rgb': '139, 69, 19',
            '--admin-border': '#e1e5e9',
            '--admin-border-radius': '8px',
            '--admin-bg-secondary': '#f8f9fa',
            '--admin-text-primary': '#333',
            '--admin-text-secondary': '#666',
            '--admin-text-tertiary': '#999',
            '--admin-card-bg': '#ffffff',
            '--admin-input-bg': '#ffffff',
            '--admin-section-bg': '#f8f9fa',
            '--admin-hover-bg': '#f1f3f4',
            '--admin-surface-hover': '#f8f9fa',
            '--admin-success': '#27ae60',
            '--star-color': '#fbbf24'
        };

        // Apply light theme variables
        Object.entries(lightVars).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });

        // Remove dark-specific variables
        document.documentElement.style.removeProperty('--link-color');
        document.documentElement.style.removeProperty('--link-hover-color');
    }

    // Add smooth transition for theme change
    if (!document.body.style.transition) {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        // Remove transition after animation completes
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    // Dispatch custom event for theme change
    const themeChangeEvent = new CustomEvent('themeChanged', {
        detail: {
            theme: theme,
            timestamp: Date.now()
        }
    });
    document.dispatchEvent(themeChangeEvent);

    console.log('✅ Theme applied. Data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('📝 Body classes:', document.body.className);
}

function updateIcon(theme, toggleElement = null, iconElement = null) {
    // Use provided elements or try to find them
    const themeToggle = toggleElement || document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
    const themeIcon = iconElement || document.getElementById('themeIcon') || document.querySelector('.theme-toggle i');

    if (!themeIcon || !themeToggle) {
        console.warn('⚠️ Icon elements not found for update');
        return;
    }

    // Validate theme
    if (theme !== 'light' && theme !== 'dark') {
        console.warn('⚠️ Invalid theme for icon update:', theme);
        return;
    }

    if (theme === 'dark') {
        // Dark mode shows sun icon (to switch to light)
        themeIcon.className = 'fas fa-sun';
        themeToggle.setAttribute('title', 'Switch to light mode');
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
        // Light mode shows moon icon (to switch to dark)
        themeIcon.className = 'fas fa-moon';
        themeToggle.setAttribute('title', 'Switch to dark mode');
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }

    console.log('🔄 Icon updated for theme:', theme);
}

// Utility functions for external use
window.themeToggleUtils = {
    // Manual test function
    testToggle: function() {
        console.log('🧪 Manual theme toggle test');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.themeToggleState.currentTheme = newTheme;

        const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
        const themeIcon = document.getElementById('themeIcon') || document.querySelector('.theme-toggle i');
        if (themeToggle && themeIcon) {
            updateIcon(newTheme, themeToggle, themeIcon);
        }

        console.log('🧪 Test complete. New theme:', newTheme);
    },

    // Get current theme
    getCurrentTheme: function() {
        return window.themeToggleState.currentTheme;
    },

    // Force set theme
    setTheme: function(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('❌ Invalid theme. Use "light" or "dark"');
            return false;
        }

        applyTheme(theme);
        localStorage.setItem('theme', theme);
        window.themeToggleState.currentTheme = theme;

        const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
        const themeIcon = document.getElementById('themeIcon') || document.querySelector('.theme-toggle i');
        if (themeToggle && themeIcon) {
            updateIcon(theme, themeToggle, themeIcon);
        }

        console.log('🎨 Theme set to:', theme);
        return true;
    },

    // Check if theme toggle is initialized
    isInitialized: function() {
        return window.themeToggleState.initialized;
    },

    // Reinitialize theme toggle (useful for dynamic content)
    reinitialize: function() {
        console.log('🔄 Reinitializing theme toggle...');
        window.themeToggleState.initialized = false;
        initializeThemeToggle();
    }
};

// Backward compatibility
window.testThemeToggle = window.themeToggleUtils.testToggle;

// Debug information
console.log('🎨 Theme Toggle Script Loaded Successfully');
console.log('📋 Available utilities:', Object.keys(window.themeToggleUtils));
console.log('🌙 Current theme state:', window.themeToggleState);
