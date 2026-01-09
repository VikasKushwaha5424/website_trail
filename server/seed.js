const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const users = [
  // --- STUDENTS ---
  { 
    rollNumber: "202300001", 
    email: "vikaskushwaha5424@gmail.com", 
    passwordHash: "123", // In real app, this should be encrypted
    role: "Student",
    isActive: true
  },
  { 
    rollNumber: "21CSE002", 
    email: "vikaskushwaha54240000@gmail.com", 
    passwordHash: "123", 
    role: "Student",
    isActive: true
  },

  // --- ADMIN ---
  { 
    rollNumber: "ADMIN01", 
    email: "admin@college.com", 
    passwordHash: "123", 
    role: "Admin",
    isActive: true
  },

  // --- INSTRUCTORS ---
  { 
    rollNumber: "INS01", 
    email: "ravi@college.com", 
    passwordHash: "123", 
    role: "Instructor",
    isActive: true
  },

  // --- PRINCIPAL ---
  { 
    rollNumber: "PRIN01", 
    email: "principal@college.com", 
    passwordHash: "123", 
    role: "Principal",
    isActive: true
  }
];

const importData = async () => {
  try {
    await User.deleteMany(); // Clear old data
    await User.insertMany(users);
    console.log("Authentication DB Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();