const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/the-project-faith');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample clothing products data
const sampleProducts = [
    {
        name: "Classic White Cotton Shirt",
        description: "Premium quality white cotton shirt perfect for formal and casual occasions. Made from 100% Egyptian cotton with a comfortable fit and elegant design.",
        price: 45.99,
        originalPrice: 59.99,
        category: "men-shirts",
        brand: "The Project Faith",
        sku: "TPF-MS-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop",
                alt: "Classic White Cotton Shirt - Front View",
                isPrimary: true
            },
            {
                url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
                alt: "Classic White Cotton Shirt - Side View"
            }
        ],
        variants: [
            { size: "S", color: "White", stock: 15, price: 45.99 },
            { size: "M", color: "White", stock: 20, price: 45.99 },
            { size: "L", color: "White", stock: 18, price: 45.99 },
            { size: "XL", color: "White", stock: 12, price: 45.99 }
        ],
        status: "active",
        featured: true,
        showOnHomepage: true,
        tags: ["cotton", "formal", "casual", "white", "shirt"],
        specifications: {
            material: "100% Egyptian Cotton",
            care: "Machine wash cold, tumble dry low",
            origin: "Jordan",
            weight: "200g"
        }
    },
    {
        name: "Elegant Black Evening Dress",
        description: "Stunning black evening dress perfect for special occasions. Features a flattering silhouette with premium fabric and exquisite detailing.",
        price: 89.99,
        originalPrice: 119.99,
        category: "women-dresses",
        brand: "The Project Faith",
        sku: "TPF-WD-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=500&h=600&fit=crop",
                alt: "Elegant Black Evening Dress",
                isPrimary: true
            },
            {
                url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop",
                alt: "Black Evening Dress - Detail View"
            }
        ],
        variants: [
            { size: "XS", color: "Black", stock: 8, price: 89.99 },
            { size: "S", color: "Black", stock: 12, price: 89.99 },
            { size: "M", color: "Black", stock: 15, price: 89.99 },
            { size: "L", color: "Black", stock: 10, price: 89.99 },
            { size: "XL", color: "Black", stock: 6, price: 89.99 }
        ],
        status: "active",
        featured: true,
        showOnHomepage: true,
        tags: ["dress", "evening", "black", "elegant", "formal"],
        specifications: {
            material: "95% Polyester, 5% Elastane",
            care: "Dry clean only",
            origin: "Jordan",
            weight: "350g"
        }
    },
    {
        name: "Comfortable Denim Jeans",
        description: "High-quality denim jeans with a modern fit. Perfect for everyday wear with excellent comfort and durability.",
        price: 65.99,
        category: "men-pants",
        brand: "The Project Faith",
        sku: "TPF-MP-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop",
                alt: "Comfortable Denim Jeans",
                isPrimary: true
            },
            {
                url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=600&fit=crop",
                alt: "Denim Jeans - Side View"
            }
        ],
        variants: [
            { size: "30", color: "Blue", stock: 10, price: 65.99 },
            { size: "32", color: "Blue", stock: 15, price: 65.99 },
            { size: "34", color: "Blue", stock: 18, price: 65.99 },
            { size: "36", color: "Blue", stock: 12, price: 65.99 },
            { size: "38", color: "Blue", stock: 8, price: 65.99 }
        ],
        status: "active",
        featured: false,
        showOnHomepage: true,
        tags: ["jeans", "denim", "casual", "blue", "comfortable"],
        specifications: {
            material: "98% Cotton, 2% Elastane",
            care: "Machine wash cold, hang dry",
            origin: "Jordan",
            weight: "450g"
        }
    },
    {
        name: "Stylish Leather Jacket",
        description: "Premium leather jacket with a modern design. Perfect for adding style to any outfit with genuine leather construction.",
        price: 149.99,
        originalPrice: 199.99,
        category: "men-jackets",
        brand: "The Project Faith",
        sku: "TPF-MJ-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop",
                alt: "Stylish Leather Jacket",
                isPrimary: true
            },
            {
                url: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&h=600&fit=crop",
                alt: "Leather Jacket - Detail View"
            }
        ],
        variants: [
            { size: "S", color: "Black", stock: 5, price: 149.99 },
            { size: "M", color: "Black", stock: 8, price: 149.99 },
            { size: "L", color: "Black", stock: 6, price: 149.99 },
            { size: "XL", color: "Black", stock: 4, price: 149.99 }
        ],
        status: "active",
        featured: true,
        showOnHomepage: true,
        tags: ["leather", "jacket", "black", "stylish", "premium"],
        specifications: {
            material: "100% Genuine Leather",
            care: "Professional leather cleaning only",
            origin: "Jordan",
            weight: "800g"
        }
    },
    {
        name: "Casual Summer Top",
        description: "Light and comfortable summer top perfect for warm weather. Made from breathable fabric with a relaxed fit.",
        price: 29.99,
        category: "women-tops",
        brand: "The Project Faith",
        sku: "TPF-WT-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1564257577-2d5d8b2b8b8b?w=500&h=600&fit=crop",
                alt: "Casual Summer Top",
                isPrimary: true
            }
        ],
        variants: [
            { size: "XS", color: "Pink", stock: 12, price: 29.99 },
            { size: "S", color: "Pink", stock: 15, price: 29.99 },
            { size: "M", color: "Pink", stock: 18, price: 29.99 },
            { size: "L", color: "Pink", stock: 10, price: 29.99 },
            { size: "XS", color: "Blue", stock: 10, price: 29.99 },
            { size: "S", color: "Blue", stock: 12, price: 29.99 },
            { size: "M", color: "Blue", stock: 15, price: 29.99 },
            { size: "L", color: "Blue", stock: 8, price: 29.99 }
        ],
        status: "active",
        featured: false,
        showOnHomepage: true,
        tags: ["summer", "casual", "top", "comfortable", "breathable"],
        specifications: {
            material: "60% Cotton, 40% Polyester",
            care: "Machine wash cold, tumble dry low",
            origin: "Jordan",
            weight: "150g"
        }
    },
    {
        name: "Kids Colorful T-Shirt",
        description: "Fun and colorful t-shirt for kids. Made from soft cotton with vibrant prints that kids love.",
        price: 19.99,
        category: "kids-boys",
        brand: "The Project Faith",
        sku: "TPF-KB-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500&h=600&fit=crop",
                alt: "Kids Colorful T-Shirt",
                isPrimary: true
            }
        ],
        variants: [
            { size: "XS", color: "Red", stock: 20, price: 19.99 },
            { size: "S", color: "Red", stock: 25, price: 19.99 },
            { size: "M", color: "Red", stock: 22, price: 19.99 },
            { size: "XS", color: "Blue", stock: 18, price: 19.99 },
            { size: "S", color: "Blue", stock: 20, price: 19.99 },
            { size: "M", color: "Blue", stock: 15, price: 19.99 }
        ],
        status: "active",
        featured: false,
        showOnHomepage: true,
        tags: ["kids", "colorful", "tshirt", "cotton", "fun"],
        specifications: {
            material: "100% Cotton",
            care: "Machine wash warm, tumble dry low",
            origin: "Jordan",
            weight: "120g"
        }
    },
    {
        name: "Elegant Women's Heels",
        description: "Sophisticated high heels perfect for formal occasions. Comfortable design with premium materials.",
        price: 79.99,
        originalPrice: 99.99,
        category: "women-shoes",
        brand: "The Project Faith",
        sku: "TPF-WS-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=600&fit=crop",
                alt: "Elegant Women's Heels",
                isPrimary: true
            }
        ],
        variants: [
            { size: "36", color: "Black", stock: 8, price: 79.99 },
            { size: "37", color: "Black", stock: 10, price: 79.99 },
            { size: "38", color: "Black", stock: 12, price: 79.99 },
            { size: "39", color: "Black", stock: 10, price: 79.99 },
            { size: "40", color: "Black", stock: 6, price: 79.99 }
        ],
        status: "active",
        featured: true,
        showOnHomepage: true,
        tags: ["heels", "elegant", "formal", "black", "women"],
        specifications: {
            material: "Synthetic Leather",
            care: "Wipe clean with damp cloth",
            origin: "Jordan",
            weight: "400g"
        }
    },
    {
        name: "Classic Men's Sneakers",
        description: "Comfortable and stylish sneakers for everyday wear. Perfect combination of style and comfort.",
        price: 55.99,
        category: "men-shoes",
        brand: "The Project Faith",
        sku: "TPF-MSH-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop",
                alt: "Classic Men's Sneakers",
                isPrimary: true
            }
        ],
        variants: [
            { size: "40", color: "White", stock: 15, price: 55.99 },
            { size: "41", color: "White", stock: 18, price: 55.99 },
            { size: "42", color: "White", stock: 20, price: 55.99 },
            { size: "43", color: "White", stock: 15, price: 55.99 },
            { size: "44", color: "White", stock: 10, price: 55.99 }
        ],
        status: "active",
        featured: false,
        showOnHomepage: true,
        tags: ["sneakers", "casual", "comfortable", "white", "men"],
        specifications: {
            material: "Canvas and Rubber",
            care: "Machine wash cold, air dry",
            origin: "Jordan",
            weight: "600g"
        }
    },
    {
        name: "Stylish Women's Handbag",
        description: "Elegant handbag perfect for daily use. Spacious interior with multiple compartments and premium finish.",
        price: 69.99,
        originalPrice: 89.99,
        category: "women-accessories",
        brand: "The Project Faith",
        sku: "TPF-WA-001",
        images: [
            {
                url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop",
                alt: "Stylish Women's Handbag",
                isPrimary: true
            }
        ],
        variants: [
            { size: "One Size", color: "Brown", stock: 12, price: 69.99 },
            { size: "One Size", color: "Black", stock: 15, price: 69.99 },
            { size: "One Size", color: "Beige", stock: 8, price: 69.99 }
        ],
        status: "active",
        featured: true,
        showOnHomepage: true,
        tags: ["handbag", "elegant", "accessories", "spacious", "women"],
        specifications: {
            material: "PU Leather",
            care: "Wipe clean with damp cloth",
            origin: "Jordan",
            weight: "500g"
        }
    }
];

// Create admin user
const createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@theprojectfaith.com' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }

        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@theprojectfaith.com',
            password: 'admin123',
            role: 'admin',
            status: 'active',
            phone: '+962-7-1234-5678',
            address: {
                street: '123 Admin Street',
                city: 'Amman',
                state: 'Amman',
                zipCode: '11111',
                country: 'Jordan'
            }
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
};

// Seed products
const seedProducts = async () => {
    try {
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log(`✅ Added ${sampleProducts.length} sample products`);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
};

// Main seeding function
const seedDatabase = async () => {
    try {
        await connectDB();
        await createAdminUser();
        await seedProducts();
        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };
