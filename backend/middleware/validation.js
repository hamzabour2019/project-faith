const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// User validation rules
const validateUserRegistration = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

const validateUserUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Street address cannot exceed 200 characters'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),
    handleValidationErrors
];

// Product validation rules
const validateProduct = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('originalPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Original price must be a positive number'),
    body('category')
        .isIn([
            'men-shirts', 'men-pants', 'men-jackets', 'men-shoes', 'men-accessories',
            'women-dresses', 'women-tops', 'women-pants', 'women-shoes', 'women-accessories',
            'kids-boys', 'kids-girls', 'kids-shoes', 'sale'
        ])
        .withMessage('Invalid category'),
    body('sku')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('SKU must be between 3 and 20 characters'),
    body('variants')
        .isArray({ min: 1 })
        .withMessage('At least one variant is required'),
    body('variants.*.size')
        .optional()
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'])
        .withMessage('Invalid size'),
    body('variants.*.stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('images')
        .isArray({ min: 1 })
        .withMessage('At least one image is required'),
    body('images.*.url')
        .isURL()
        .withMessage('Invalid image URL'),
    handleValidationErrors
];

const validateProductUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('originalPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Original price must be a positive number'),
    body('category')
        .optional()
        .isIn([
            'men-shirts', 'men-pants', 'men-jackets', 'men-shoes', 'men-accessories',
            'women-dresses', 'women-tops', 'women-pants', 'women-shoes', 'women-accessories',
            'kids-boys', 'kids-girls', 'kids-shoes', 'sale'
        ])
        .withMessage('Invalid category'),
    handleValidationErrors
];

// Order validation rules
const validateOrder = [
    body('customerInfo.firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('customerInfo.lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('customerInfo.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('customerInfo.phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('shippingAddress.street')
        .trim()
        .notEmpty()
        .withMessage('Street address is required'),
    body('shippingAddress.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('shippingAddress.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('shippingAddress.zipCode')
        .trim()
        .notEmpty()
        .withMessage('ZIP code is required'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.product')
        .isMongoId()
        .withMessage('Invalid product ID'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`),
    handleValidationErrors
];

// Query validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    validateProduct,
    validateProductUpdate,
    validateOrder,
    validateObjectId,
    validatePagination
};
