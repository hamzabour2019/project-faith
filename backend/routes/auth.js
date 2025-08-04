const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// POST /api/auth/register - Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Return user data without password
        const userData = user.getPublicProfile();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userData,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

// POST /api/auth/login - User login
router.post('/login', validateUserLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                error: 'Account is not active'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Return user data without password
        const userData = user.getPublicProfile();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userData = req.user.getPublicProfile();
        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
});

// POST /api/auth/logout - User logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success and let client remove token
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id);
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
});

// POST /api/auth/verify-token - Verify if token is valid
router.post('/verify-token', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: req.user.getPublicProfile()
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            error: 'Token verification failed'
        });
    }
});

module.exports = router;
