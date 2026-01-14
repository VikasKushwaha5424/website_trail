const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// 1. LOAD ENV VARS CORRECTLY
dotenv.config(); 

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Department = require('./models/Department');

// 2. DIAGNOSTIC LOGGING
const MONGO_URI = process.env.MONGO_URI;
console.log("==========================================");
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is undefined. Check your .env file!");
    process.exit(1);
}
console.log(`🔌 CONNECTING TO DATABASE...`);
console.log("==========================================");

const seedData = async () => {
  try {
    // 3. CONNECT
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 4. CLEAR OLD DATA
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Department.deleteMany({});
    console.log('🗑️  Old database cleared.');

    // 5. PREPARE DATA
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Create Department
    const dept = await Department.create({ 
        name: 'Computer Science', 
        code: 'CSE', 
        isActive: true 
    });
    console.log('✅ Department created.');

    // --- CREATE STUDENT ---
    const student = await User.create({
      name: "Rohan Student",
      email: "rohan.student@college.edu",
      role: "student",
      rollNumber: "2026000001",
      // 👇 FIX: Using the exact key 'passwordHash' from your Schema
      passwordHash: hashedPassword, 
      isActive: true
    });

    await StudentProfile.create({
      userId: student._id,
      firstName: "Rohan",
      rollNumber: "2026000001",
      departmentId: dept._id,
      batchYear: 2026
    });
    console.log('✅ Student User & Profile created.');

    // --- CREATE ADMIN (You) ---
    const googleUser = await User.create({
        name: "Vikas Google",
        email: "vikaskushwaha5424@gmail.com", 
        role: "admin", 
        rollNumber: "ADMIN001",
        // 👇 FIX: Using the exact key 'passwordHash'
        passwordHash: hashedPassword,
        isActive: true
    });
    console.log('✅ Admin User created.');

    console.log("\n------------------------------------------");
    console.log("🎉 SEEDING COMPLETE!");
    console.log("👉 Login 1 (Manual):  ID: 2026000001   | Pass: password123");
    console.log("👉 Login 2 (Google):  Use 'vikaskushwaha5424@gmail.com'");
    console.log("------------------------------------------");

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedData();