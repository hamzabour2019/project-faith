# The Project Faith - Professional Clothing Store

A modern, full-stack e-commerce website for a clothing brand featuring elegant design, real backend with MongoDB, and comprehensive functionality.

## 🚀 Quick Start

### Windows
```bash
# Double-click start.bat or run in command prompt
start.bat
```

### Linux/Mac
```bash
# Make executable and run
chmod +x start.sh
./start.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Seed database with sample products
node backend/seedData.js

# Start the server
npm start
```

Visit: http://localhost:3000

**Admin Login:**
- Email: admin@theprojectfaith.com
- Password: admin123

## ✨ Complete System Transformation

### 🔄 From localStorage to Real Database
- **Removed localStorage dependency** - Now uses MongoDB
- **Full REST API** - Professional backend with Express.js
- **JWT Authentication** - Secure user sessions
- **Real Product Management** - Add, edit, delete products through admin panel
- **Persistent Data** - All data stored in database

### 🛍️ Real Clothing Store Features
- **Authentic Products**: Real clothing items with proper categories
- **Inventory Management**: Track stock levels and variants (sizes, colors)
- **Order Processing**: Complete order lifecycle from cart to delivery
- **User Accounts**: Customer registration and profile management
- **Admin Dashboard**: Comprehensive store management interface

### 🔐 Security & Authentication
- **JWT Tokens** for secure authentication
- **Password Encryption** with bcrypt
- **Role-based Access** (Customer, Admin)
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── models/          # MongoDB schemas (User, Product, Order)
├── routes/          # API endpoints
├── middleware/      # Authentication & validation
├── server.js        # Main server file
└── seedData.js      # Sample data seeder
```

### Frontend (Vanilla JavaScript)
```
js/
├── api.js           # API client for backend communication
├── auth.js          # Authentication management
├── main.js          # Core functionality
├── cart.js          # Shopping cart
├── admin.js         # Admin panel functionality
└── ...
```

### Database Schema
- **Users**: Authentication, profiles, preferences
- **Products**: Clothing items with variants, images, inventory
- **Orders**: Purchase history, status tracking, shipping

## 🎯 Features

### 👥 User Management
- **Customer Registration/Login** with email verification
- **Profile Management** with order history
- **Admin Panel** for user administration
- **Role-based Permissions** (Customer, Admin)

### 🛒 Product Management
- **Real Clothing Categories**: Men's, Women's, Kids' clothing
- **Product Variants**: Sizes, colors, stock levels
- **Image Management**: Multiple product images
- **Inventory Tracking**: Real-time stock updates
- **Admin CRUD Operations**: Full product lifecycle management

### 📦 Order Management
- **Shopping Cart** with persistent sessions
- **Checkout Process** with customer information
- **Order Tracking** with status updates
- **Admin Order Management** with status controls
- **Inventory Updates** on purchase

### 🎨 Enhanced UI/UX
- **Responsive Design** for all devices
- **Dark/Light Themes** with smooth transitions
- **Loading States** and error handling
- **Real-time Updates** from backend
- **Professional Admin Interface**

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security middleware

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests to backend
- **CSS3** - Modern styling with custom properties
- **HTML5** - Semantic markup

## 📋 Requirements

- **Node.js** 14+ and npm
- **MongoDB** (local or Atlas)
- Modern web browser

## 🔧 Configuration

### Environment Variables (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/the-project-faith
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@theprojectfaith.com
ADMIN_PASSWORD=admin123
```

## 📊 Sample Data

The system includes realistic clothing products:
- **Men's Clothing**: Shirts, pants, jackets, shoes
- **Women's Clothing**: Dresses, tops, shoes, accessories
- **Kids' Clothing**: Boys and girls items
- **Accessories**: Handbags, jewelry, etc.

## 🚀 Deployment

### Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production
```bash
npm start    # Production server
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

## 🎯 Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications for orders
- Product reviews and ratings
- Advanced search and filtering
- Inventory alerts for low stock
- Sales analytics and reporting
- Multi-language support
- Mobile app development

## 📞 Support

For technical support or questions:
- Check the `SETUP_GUIDE.md` for detailed setup instructions
- Review the API documentation
- Contact the development team

---

**The Project Faith** - Professional E-commerce Solution 🌟
