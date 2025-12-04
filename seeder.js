import mongoose from 'mongoose';
import dotenv from 'dotenv/config';
import bcrypt from 'bcrypt'; // Agar error aaye toh 'bcrypt' try karein
import User from './models/userSchema.js' // Apna Model Path check karlena (src/models/...)



const seedUsers = async () => {
    try {
      
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URI not found in .env file");
        }
        
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected sucessfully");

        
        await User.deleteMany({ email: { $in: ['admin@demo.com', 'user@demo.com'] } });
        console.log("Old demo users cleared.");

        
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const userPassword = await bcrypt.hash('user123', salt);
        
        
        const users = [
            {
                username: "Super Admin",
                email: "admin@demo.com",
                password: adminPassword,
                role: "Admin" 
            },
            {
                username: "Demo User",
                email: "user@demo.com",
                password: userPassword,
                role: "Customer"
            }
        ];

        
        await User.insertMany(users);
        console.log(" SUCCESS! Database updated.");
        console.log("Admin Login: admin@demo.com | admin123");
        console.log("User Login:  user@demo.com  | user123");
       

        process.exit();

    } catch (error) {
        console.error(` Error: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();