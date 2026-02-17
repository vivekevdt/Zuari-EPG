import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const createTestUser = async () => {
    connectDB();
    try {

        const testUser = {
            name: 'Talha Parkar',
            email: 'talha.parkar@adventz.com',
            password: 'talha@1234',
            entity: "Zuari Industries Limited",
            role: "user"
        };

        const existingUser = await User.findOne({ email: testUser.email });

        if (existingUser) {
            console.log('Test user already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testUser.password, salt);

        const user = await User.create({
            name: testUser.name,
            email: testUser.email,
            password: hashedPassword,
            entity: testUser.entity,
            role: testUser.role
        });

        console.log('Test user created successfully:', user);
        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser();
