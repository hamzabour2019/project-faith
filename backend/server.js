const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Compression middleware
app.use(compression());

// Security middleware
if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
                fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https:", "images.unsplash.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
                connectSrc: ["'self'"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));
} else {
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (process.env.NODE_ENV === 'production') {
            const allowedOrigins = process.env.CORS_ORIGIN ?
                process.env.CORS_ORIGIN.split(',') :
                ['https://yourproductiondomain.com'];

            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // Development - allow all origins
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-project-faith';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'The Project Faith API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve HTML files for different routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../products.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../product.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../checkout.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../signup.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-dashboard.html'));
});

app.get('/admin/*', (req, res) => {
    const adminFile = req.params[0];
    res.sendFile(path.join(__dirname, `../admin-${adminFile}.html`));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS policy violation',
            message: 'Origin not allowed'
        });
    }

    // Production error handling
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
            error: 'Internal server error',
            message: 'Something went wrong on our end'
        });
    } else {
        // Development error handling
        res.status(500).json({
            error: 'Something went wrong!',
            message: err.message,
            stack: err.stack
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.sendFile(path.join(__dirname, '../index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💾 Database: ${MONGODB_URI}`);
});

module.exports = app;
