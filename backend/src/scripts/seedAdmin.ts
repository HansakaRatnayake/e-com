import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@ecommerce.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            email: 'admin@ecommerce.com',
            password: 'Admin123!', // Change this password immediately after first login
            role: 'admin',
            profile: {
                firstName: 'Admin',
                lastName: 'User'
            },
            isVerified: true,
            isApproved: true
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@ecommerce.com');
        console.log('Password: Admin123! (Please change this immediately)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();