# The Project Faith - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Environment Variables Required:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://hamzabour2019:hamzahamza1234@cluster0.16yrv5p.mongodb.net/the-project-faith?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@theprojectfaith.com
ADMIN_PASSWORD=admin123
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

### Project Structure:
- Frontend files in root directory
- Backend API in `/backend` folder
- Static assets in `/css`, `/js`, `/images`

### Default Admin Login:
- Email: admin@theprojectfaith.com
- Password: admin123

### Features:
- ✅ User Authentication
- ✅ Product Management
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Admin Dashboard
- ✅ Responsive Design
- ✅ MongoDB Integration
