const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateOrder, validateObjectId, validatePagination } = require('../middleware/validation');

// GET /api/orders - Get all orders (Admin only) or user's orders
router.get('/', authenticateToken, validatePagination, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            paymentStatus,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // If not admin, only show user's orders
        if (req.user.role !== 'admin') {
            filter.user = req.user._id;
        }

        if (status) {
            filter.status = status;
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [orders, totalCount] = await Promise.all([
            Order.find(filter)
                .populate('user', 'firstName lastName email')
                .populate('items.product', 'name images sku')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: {
                orders,
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
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
});

// GET /api/orders/stats - Get order statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = await Order.getOrderStats();
        
        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName')
            .select('orderNumber customerInfo pricing status createdAt');

        // Get monthly revenue for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$pricing.total' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                ...stats,
                recentOrders,
                monthlyRevenue
            }
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order statistics'
        });
    }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name images sku')
            .populate('statusHistory.updatedBy', 'firstName lastName');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user can access this order
        if (req.user.role !== 'admin' && order.user && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order'
        });
    }
});

// POST /api/orders - Create new order
router.post('/', optionalAuth, validateOrder, async (req, res) => {
    try {
        const { customerInfo, shippingAddress, billingAddress, items, paymentMethod } = req.body;

        // Validate and process items
        const processedItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    error: `Product not found: ${item.product}`
                });
            }

            if (product.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    error: `Product is not available: ${product.name}`
                });
            }

            // Find the specific variant
            let variant = null;
            if (item.variant && (item.variant.size || item.variant.color)) {
                variant = product.variants.find(v => 
                    (!item.variant.size || v.size === item.variant.size) &&
                    (!item.variant.color || v.color === item.variant.color)
                );

                if (!variant) {
                    return res.status(400).json({
                        success: false,
                        error: `Variant not found for product: ${product.name}`
                    });
                }

                if (variant.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        error: `Insufficient stock for ${product.name} (${variant.size || ''} ${variant.color || ''})`
                    });
                }
            } else if (product.totalStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient stock for ${product.name}`
                });
            }

            const itemPrice = variant?.price || product.price;
            const itemTotal = itemPrice * item.quantity;

            processedItems.push({
                product: product._id,
                productSnapshot: {
                    name: product.name,
                    price: itemPrice,
                    image: product.primaryImage,
                    sku: product.sku
                },
                variant: item.variant || {},
                quantity: item.quantity,
                price: itemPrice,
                total: itemTotal
            });

            subtotal += itemTotal;
        }

        // Calculate pricing
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const tax = subtotal * 0.16; // 16% tax (Jordan VAT)
        const total = subtotal + shipping + tax;

        // Create order
        const orderData = {
            user: req.user?._id || null,
            customerInfo,
            shippingAddress,
            billingAddress: billingAddress?.sameAsShipping !== false ? shippingAddress : billingAddress,
            items: processedItems,
            pricing: {
                subtotal,
                shipping,
                tax,
                discount: 0,
                total
            },
            paymentMethod: paymentMethod || 'cash-on-delivery',
            status: 'pending',
            paymentStatus: paymentMethod === 'cash-on-delivery' ? 'pending' : 'pending'
        };

        const order = new Order(orderData);
        await order.save();

        // Update product stock
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const product = await Product.findById(item.product);
            
            if (item.variant && (item.variant.size || item.variant.color)) {
                const variant = product.variants.find(v => 
                    (!item.variant.size || v.size === item.variant.size) &&
                    (!item.variant.color || v.color === item.variant.color)
                );
                if (variant) {
                    variant.stock -= item.quantity;
                }
            }
            
            product.salesCount += item.quantity;
            await product.save();
        }

        // Update user stats if logged in
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: {
                    'stats.totalOrders': 1,
                    'stats.totalSpent': total
                }
            });
        }

        // Populate the created order
        const populatedOrder = await Order.findById(order._id)
            .populate('items.product', 'name images sku');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create order'
        });
    }
});

// PATCH /api/orders/:id/status - Update order status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const { status, note } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Add to status history
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note: note || '',
            updatedBy: req.user._id
        });

        order.status = status;

        // Update payment status if order is delivered
        if (status === 'delivered' && order.paymentMethod === 'cash-on-delivery') {
            order.paymentStatus = 'paid';
            order.paymentDetails = {
                paymentDate: new Date(),
                paymentGateway: 'cash-on-delivery'
            };
        }

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name images sku')
            .populate('statusHistory.updatedBy', 'firstName lastName');

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update order status'
        });
    }
});

// PATCH /api/orders/:id/shipping - Update shipping info (Admin only)
router.patch('/:id/shipping', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const { trackingNumber, carrier, estimatedDelivery } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                'shipping.trackingNumber': trackingNumber,
                'shipping.carrier': carrier,
                'shipping.estimatedDelivery': estimatedDelivery ? new Date(estimatedDelivery) : undefined
            },
            { new: true }
        ).populate('user', 'firstName lastName email')
         .populate('items.product', 'name images sku');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Shipping information updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Update shipping info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update shipping information'
        });
    }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', authenticateToken, validateObjectId('id'), async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user can cancel this order
        if (req.user.role !== 'admin' && order.user && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'Order cannot be cancelled at this stage'
            });
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product && item.variant && (item.variant.size || item.variant.color)) {
                const variant = product.variants.find(v =>
                    (!item.variant.size || v.size === item.variant.size) &&
                    (!item.variant.color || v.color === item.variant.color)
                );
                if (variant) {
                    variant.stock += item.quantity;
                    await product.save();
                }
            }
        }

        // Update order status
        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: reason || 'Order cancelled by user',
            updatedBy: req.user._id
        });

        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel order'
        });
    }
});

// GET /api/orders/track/:orderNumber - Track order by order number (public)
router.get('/track/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber })
            .select('orderNumber status paymentStatus shipping statusHistory customerInfo pricing createdAt')
            .populate('statusHistory.updatedBy', 'firstName lastName');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track order'
        });
    }
});

module.exports = router;
