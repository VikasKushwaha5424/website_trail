const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Import Models
const User = require("./models/User");
const Student = require("./models/Student");
const FacultyProfile = require("./models/FacultyProfile");
const Department = require("./models/Department");
const Course = require("./models/Course");
const FacultyCourse = require("./models/FacultyCourse");

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const seedData = async () => {
  try {
    console.log("🔴 Clearing existing data...");
    // 1. Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await FacultyProfile.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});
    await FacultyCourse.deleteMany({});
    
    console.log("🧹 Database Cleared");

    // 2. Create Department
    const cse = await Department.create({ 
      departmentName: "Computer Science", 
      departmentCode: "CSE" 
    });
    console.log("🏢 Dept Created: CSE");

    // 3. Create Course (UPDATED TO FIX YOUR ERROR)
    const cs101 = await Course.create({
      subjectName: "Intro to Programming", // Fixed: matches schema
      subjectCode: "CS101",                // Fixed: matches schema
      departmentId: cse._id,
      credits: 4,
      academicYear: "2024-2025",           // Added: Required by your schema
      semester: 1                          // Added: Required by your schema
    });
    console.log("📚 Course Created: CS101");

    // 4. Create Admin User
    const adminPass = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Super Admin",
      email: "admin@college.edu",
      passwordHash: adminPass,
      role: "Admin",
      rollNumber: "ADM001"
    });
    console.log("🛠️ Admin Created: admin@college.edu");

    // 5. Create Faculty User & Profile
    const commonPass = await bcrypt.hash("123456", 10);
    
    const facultyUser = await User.create({
      name: "Dr. Smith",
      email: "faculty@college.edu",
      passwordHash: commonPass,
      role: "Faculty",
      rollNumber: "FAC001"
    });

    await FacultyProfile.create({
      userId: facultyUser._id,
      departmentId: cse._id,
      qualification: "Ph.D in AI"
    });

    // 6. Assign Faculty to Course
    await FacultyCourse.create({
      facultyId: facultyUser._id,
      courseId: cs101._id
    });
    console.log("👨‍🏫 Faculty Created & Assigned: Dr. Smith -> CS101");

    // 7. Create Student User & Profile
    const studentUser = await User.create({
      name: "Rahul Kumar",
      email: "student@college.edu",
      passwordHash: commonPass,
      role: "Student",
      rollNumber: "21CSE01"
    });

    await Student.create({
      userId: studentUser._id,
      departmentId: cse._id,
      rollNo: "21CSE01",
      batch: 2024
    });
    console.log("🎓 Student Created: Rahul (CSE)");

    console.log("✅ SEEDING COMPLETE! Press Ctrl + C to exit.");
    process.exit();

  } catch (err) {
    console.error("❌ Error Seeding:", err);
    if (err.errors) console.error("Details:", err.errors);
    process.exit(1);
  }
};

seedData();