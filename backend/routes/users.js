const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId, validatePagination } = require('../middleware/validation');

// GET /api/users - Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (role) {
            filter.role = role;
        }

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [users, totalCount] = await Promise.all([
            User.find(filter)
                .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// GET /api/users/stats - Get user statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    adminUsers: {
                        $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                    },
                    customerUsers: {
                        $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
                    }
                }
            }
        ]);

        const roleStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const statusStats = await User.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalUsers: 0,
                    activeUsers: 0,
                    adminUsers: 0,
                    customerUsers: 0
                },
                roleBreakdown: roleStats,
                statusBreakdown: statusStats
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user statistics'
        });
    }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, requireOwnershipOrAdmin('id'), validateObjectId('id'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, requireOwnershipOrAdmin('id'), validateObjectId('id'), validateUserUpdate, async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Only admins can update role and status
        if (req.user.role !== 'admin') {
            delete updateData.role;
            delete updateData.status;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete your own account'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

// GET /api/users/:id/orders - Get user orders
router.get('/:id/orders', authenticateToken, requireOwnershipOrAdmin('id'), validateObjectId('id'), async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, totalCount] = await Promise.all([
            Order.find({ user: req.params.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('items.product', 'name images'),
            Order.countDocuments({ user: req.params.id })
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user orders'
        });
    }
});

// PATCH /api/users/:id/status - Update user status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be active, inactive, or suspended'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    }
});

module.exports = router;
