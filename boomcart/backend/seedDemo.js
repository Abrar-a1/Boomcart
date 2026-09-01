const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ email: 'admin@boomcart.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@boomcart.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      });
      console.log('Created dummy admin');
    }

    const demoProducts = [
      {
        name: 'Elegant Red Bridal Lehenga',
        description: 'A beautiful handcrafted red lehenga with intricate zari work, perfect for your special day.',
        price: 45000,
        discountPrice: 42000,
        category: 'bridal',
        subCategory: 'lehenga',
        images: [{ url: 'https://images.unsplash.com/photo-1583391733958-d25e0b46e2e5?q=80&w=600', publicId: 'demo1' }],
        sizes: [{ size: 'M', stock: 5 }, { size: 'L', stock: 2 }],
        colors: ['Red', 'Maroon'],
        stock: 7,
        isCustomizable: true,
        hasTrial: true,
        priceRange: 'Premium',
        isFeatured: true,
        createdBy: admin._id
      },
      {
        name: 'Kids Party Wear Suit',
        description: 'Stylish 3-piece party wear suit for kids. Comfortable fabric for all-day wear.',
        price: 3500,
        category: 'kids',
        subCategory: 'suits',
        images: [{ url: 'https://images.unsplash.com/photo-1519238263530-99bea674fcc3?q=80&w=600', publicId: 'demo2' }],
        sizes: [{ size: '4-5Y', stock: 10 }, { size: '6-7Y', stock: 15 }],
        colors: ['Navy Blue'],
        stock: 25,
        ageGroup: '3-5',
        fabricType: 'Cotton Blend',
        isFeatured: true,
        createdBy: admin._id
      },
      {
        name: 'Classic Men\'s Sherwani',
        description: 'Traditional off-white sherwani with minimal golden embroidery.',
        price: 18000,
        discountPrice: 15000,
        category: 'men',
        subCategory: 'sherwani',
        images: [{ url: 'https://images.unsplash.com/photo-1594938298596-eb5fd3f6b98e?q=80&w=600', publicId: 'demo3' }],
        sizes: [{ size: 'L', stock: 4 }, { size: 'XL', stock: 3 }],
        colors: ['Off-White', 'Gold'],
        stock: 7,
        isFeatured: true,
        createdBy: admin._id
      },
      {
        name: 'Designer Silk Saree',
        description: 'Authentic Banarasi silk saree with heavy pallu. Perfect for festive occasions.',
        price: 8500,
        category: 'women',
        subCategory: 'saree',
        images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600', publicId: 'demo4' }],
        sizes: [{ size: 'Free Size', stock: 20 }],
        colors: ['Green', 'Pink'],
        stock: 20,
        isFeatured: true,
        createdBy: admin._id
      }
    ];

    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    await Product.insertMany(demoProducts);
    console.log('Demo products added successfully!');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
