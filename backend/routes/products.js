const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { 
    validateProduct, 
    validateProductUpdate, 
    validateObjectId, 
    validatePagination 
} = require('../middleware/validation');

// GET /api/products - Get all products with filtering and pagination
router.get('/', validatePagination, optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            search,
            minPrice,
            maxPrice,
            featured,
            onSale,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { status: 'active' };

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (featured === 'true') {
            filter.featured = true;
        }

        if (onSale === 'true') {
            filter.originalPrice = { $exists: true, $gt: 0 };
            filter.$expr = { $gt: ['$originalPrice', '$price'] };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [products, totalCount] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('reviews.user', 'firstName lastName'),
            Product.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: {
                products,
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
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.findFeatured().limit(8);
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured products'
        });
    }
});

// GET /api/products/categories - Get all categories with product counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('reviews.user', 'firstName lastName');

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Increment view count
        await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
});

// POST /api/products - Create new product (Admin only)
router.post('/', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
    try {
        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                error: 'Product with this SKU already exists'
            });
        }

        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create product'
        });
    }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validateObjectId('id'), validateProductUpdate, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
});

// POST /api/products/:id/reviews - Add product review
router.post('/:id/reviews', authenticateToken, validateObjectId('id'), async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.user.toString() === req.user._id.toString()
        );

        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product'
            });
        }

        // Add review
        product.reviews.push({
            user: req.user._id,
            rating,
            comment: comment || '',
            createdAt: new Date()
        });

        // Update average rating
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.ratings.average = totalRating / product.reviews.length;
        product.ratings.count = product.reviews.length;

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully'
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add review'
        });
    }
});

// GET /api/products/:id/related - Get related products
router.get('/:id/related', validateObjectId('id'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Find related products by category, excluding current product
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            status: 'active'
        }).limit(4);

        res.json({
            success: true,
            data: relatedProducts
        });
    } catch (error) {
        console.error('Get related products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch related products'
        });
    }
});

// PATCH /api/products/:id/stock - Update product stock (Admin only)
router.patch('/:id/stock', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const { variants } = req.body;

        if (!variants || !Array.isArray(variants)) {
            return res.status(400).json({
                success: false,
                error: 'Variants array is required'
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Update stock for each variant
        variants.forEach(updateVariant => {
            const variant = product.variants.find(v =>
                v.size === updateVariant.size && v.color === updateVariant.color
            );
            if (variant) {
                variant.stock = updateVariant.stock;
            }
        });

        await product.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update stock'
        });
    }
});

module.exports = router;
