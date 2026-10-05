import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/userModel.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected");

    // Admin credentials
    const adminEmail = "admin@medcare.com";
    const adminPassword = "Admin2702";

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await hashPassword(adminPassword);

    // Create admin
    const admin = await User.create({
      firstName: "System",
      lastName: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

seedAdmin();