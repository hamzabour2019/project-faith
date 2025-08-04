const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid token. User not found.' 
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({ 
                error: 'Account is not active.' 
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token.' 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired.' 
            });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required.' 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Admin access required.' 
        });
    }

    next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required.' 
            });
        }

        const resourceUserId = req.params[userIdField] || req.body[userIdField];
        
        if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
            next();
        } else {
            return res.status(403).json({ 
                error: 'Access denied. You can only access your own resources.' 
            });
        }
    };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.status === 'active') {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Verify token without middleware (for utility use)
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireOwnershipOrAdmin,
    optionalAuth,
    generateToken,
    verifyToken
};
