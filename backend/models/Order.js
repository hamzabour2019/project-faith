const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow guest orders
    },
    customerInfo: {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        }
    },
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'ZIP code is required'],
            trim: true
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
            default: 'Jordan'
        }
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        sameAsShipping: {
            type: Boolean,
            default: true
        }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productSnapshot: {
            name: String,
            price: Number,
            image: String,
            sku: String
        },
        variant: {
            size: String,
            color: String
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative']
        }
    }],
    pricing: {
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative']
        },
        shipping: {
            type: Number,
            default: 0,
            min: [0, 'Shipping cost cannot be negative']
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'Tax cannot be negative']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative']
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative']
        }
    },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        ],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash-on-delivery', 'credit-card', 'paypal', 'bank-transfer'],
        default: 'cash-on-delivery'
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        paymentGateway: String
    },
    shipping: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            default: 'standard'
        },
        trackingNumber: String,
        carrier: String,
        estimatedDelivery: Date,
        actualDelivery: Date
    },
    notes: {
        customer: String,
        admin: String
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    refund: {
        requested: {
            type: Boolean,
            default: false
        },
        reason: String,
        amount: Number,
        processedAt: Date,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full customer name
orderSchema.virtual('customerName').get(function() {
    return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

// Virtual for full shipping address
orderSchema.virtual('fullShippingAddress').get(function() {
    const addr = this.shippingAddress;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const count = await this.constructor.countDocuments();
        this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    
    // Add status change to history
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
    }
    
    next();
});

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$pricing.total' }
            }
        }
    ]);
    
    const totalOrders = await this.countDocuments();
    const totalRevenue = await this.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    
    return {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats
    };
};

module.exports = mongoose.model('Order', orderSchema);
