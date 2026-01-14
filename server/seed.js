const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load .env file

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Department = require('./models/Department');

// 🔍 DIAGNOSTIC: Check where we are connecting!
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_portal';
console.log("==========================================");
console.log(`🔌 CONNECTING TO: ${MONGO_URI}`);
console.log("==========================================");

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // CLEAR OLD DATA
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  Old database dropped (Clean Slate).');

    const passwordHash = await bcrypt.hash("password123", 10);
    const dept = await Department.create({ name: 'Computer Science', code: 'CSE', isActive: true });

    // 1️⃣ CREATE STUDENT (Login: 2026000001 / password123)
    const student = await User.create({
      name: "Rohan Student",
      email: "rohan.student@college.edu",
      role: "student",
      rollNumber: "2026000001",
      passwordHash,
      isActive: true
    });

    await StudentProfile.create({
      userId: student._id,
      firstName: "Rohan",
      rollNumber: "2026000001",
      departmentId: dept._id,
      batchYear: 2026
    });

    // 2️⃣ CREATE YOUR GOOGLE USER (For Testing Google Login)
    // Replace this email with your REAL Google email if different
    const googleUser = await User.create({
        name: "Vikas Google",
        email: "vikaskushwaha5424@gmail.com", 
        role: "admin", // Making you admin so you can see everything
        rollNumber: "ADMIN001",
        passwordHash,
        isActive: true
    });

    console.log("\n✅ SEEDING COMPLETE!");
    console.log("------------------------------------------");
    console.log("👉 Login 1 (Manual):  ID: 2026000001   | Pass: password123");
    console.log("👉 Login 2 (Google):  Use 'vikaskushwaha5424@gmail.com' button");
    console.log("------------------------------------------");

    process.exit();
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedData();