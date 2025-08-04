const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: [
            'men-shirts',
            'men-pants',
            'men-jackets',
            'men-shoes',
            'men-accessories',
            'women-dresses',
            'women-tops',
            'women-pants',
            'women-shoes',
            'women-accessories',
            'kids-boys',
            'kids-girls',
            'kids-shoes',
            'sale'
        ]
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    variants: [{
        size: {
            type: String,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42']
        },
        color: {
            type: String,
            trim: true
        },
        stock: {
            type: Number,
            required: true,
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        price: {
            type: Number,
            min: [0, 'Variant price cannot be negative']
        }
    }],
    totalStock: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out-of-stock', 'discontinued'],
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    specifications: {
        material: String,
        care: String,
        origin: String,
        weight: String
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Review comment cannot exceed 500 characters']
        },
        verified: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    salesCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual for on sale status
productSchema.virtual('onSale').get(function() {
    return this.originalPrice && this.originalPrice > this.price;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total stock
productSchema.pre('save', function(next) {
    if (this.variants && this.variants.length > 0) {
        this.totalStock = this.variants.reduce((total, variant) => total + variant.stock, 0);
    }
    
    // Update status based on stock
    if (this.totalStock === 0 && this.status === 'active') {
        this.status = 'out-of-stock';
    } else if (this.totalStock > 0 && this.status === 'out-of-stock') {
        this.status = 'active';
    }
    
    next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ category, status: 'active' });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
    return this.find({ featured: true, status: 'active' });
};

// Static method to search products
productSchema.statics.searchProducts = function(query) {
    return this.find({
        $text: { $search: query },
        status: 'active'
    }).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Product', productSchema);
