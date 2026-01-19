const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// 1. Load Environment Variables
dotenv.config();

// 2. Import Models
const User = require("./models/User");
const StudentProfile = require("./models/StudentProfile");
const FacultyProfile = require("./models/FacultyProfile");
const Department = require("./models/Department");
const Course = require("./models/Course");
const Semester = require("./models/Semester");
const CourseOffering = require("./models/CourseOffering");
const Enrollment = require("./models/Enrollment");
const Classroom = require("./models/Classroom");
const { ROLES } = require("./config/roles");

// 3. Configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/college_portal";
const DEFAULT_PASSWORD = "123456";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Connected to MongoDB...");

    // =============================================================
    // 🧹 CLEANUP
    // =============================================================
    console.log("🧹 Clearing old data...");
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      FacultyProfile.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Semester.deleteMany({}),
      CourseOffering.deleteMany({}),
      Enrollment.deleteMany({}),
      Classroom.deleteMany({})
    ]);

    // =============================================================
    // 🏗️ BASE DATA
    // =============================================================
    console.log("🏗️ Creating Infrastructure...");
    
    // Departments
    const depts = await Department.insertMany([
      { name: "Computer Science", code: "CSE" },
      { name: "Electronics", code: "ECE" }
    ]);
    const cseId = depts.find(d => d.code === "CSE")._id;
    const eceId = depts.find(d => d.code === "ECE")._id;

    // Classrooms
    await Classroom.insertMany([
      { roomNumber: "A-101", capacity: 60, type: "LECTURE_HALL", isActive: true },
      { roomNumber: "LAB-1", capacity: 30, type: "LAB", isActive: true }
    ]);

    // Semester
    const semester = await Semester.create({
      name: "Spring 2026",
      code: "SPR26",
      academicYear: "2025-2026",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-06-01"),
      isActive: true
    });

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // =============================================================
    // 👨‍🏫 FACULTY (With Login Roll Numbers)
    // =============================================================
    console.log("👨‍🏫 Creating Faculty...");

    const facultyData = [
      { name: "Dr. Alan Turing", email: "cse.head@test.com", dept: cseId, desig: "Professor", roll: "FAC-CSE-001" },
      { name: "Prof. Grace Hopper", email: "cse.fac1@test.com", dept: cseId, desig: "Assistant Professor", roll: "FAC-CSE-002" },
      { name: "Dr. Nikola Tesla", email: "ece.head@test.com", dept: eceId, desig: "Professor", roll: "FAC-ECE-001" },
      { name: "Prof. Homi Bhabha", email: "ece.fac1@test.com", dept: eceId, desig: "Assistant Professor", roll: "FAC-ECE-002" }
    ];

    const facultyProfiles = [];

    for (const f of facultyData) {
      // Create User with ROLL NUMBER
      const user = await User.create({
        name: f.name,
        email: f.email,
        passwordHash: hashedPassword,
        role: ROLES.FACULTY,
        rollNumber: f.roll, // <--- ADDED THIS
        isActive: true
      });

      const nameParts = f.name.split(" ");
      const profile = await FacultyProfile.create({
        userId: user._id,
        firstName: nameParts[0] + " " + nameParts[1],
        lastName: nameParts.slice(2).join(" ") || "Faculty",
        departmentId: f.dept,
        designation: f.desig,
        qualification: "Ph.D.",
        joiningDate: new Date("2020-01-01"),
        employmentType: "PERMANENT"
      });
      facultyProfiles.push(profile);
    }

    // =============================================================
    // 📚 COURSES
    // =============================================================
    const courses = await Course.insertMany([
      { name: "Data Structures", code: "CS101", credits: 4, departmentId: cseId },
      { name: "Operating Systems", code: "CS102", credits: 3, departmentId: cseId },
      { name: "Digital Circuits", code: "EC101", credits: 4, departmentId: eceId }
    ]);

    const offerings = await CourseOffering.insertMany([
      { facultyId: facultyProfiles[0]._id, courseId: courses[0]._id, semesterId: semester._id, capacity: 60 }, // CSE Head
      { facultyId: facultyProfiles[1]._id, courseId: courses[1]._id, semesterId: semester._id, capacity: 60 }, // CSE Fac
      { facultyId: facultyProfiles[2]._id, courseId: courses[2]._id, semesterId: semester._id, capacity: 60 }, // ECE Head
    ]);

    // =============================================================
    // 🎓 STUDENTS
    // =============================================================
    console.log("🎓 Creating Students...");

    const studentDocs = [];
    for (let i = 1; i <= 10; i++) {
      const isCSE = i <= 5;
      const dept = isCSE ? cseId : eceId;
      const deptCode = isCSE ? "CSE" : "ECE";
      const roll = `${deptCode}202600${i}`; // e.g., CSE2026001
      
      const user = await User.create({
        name: `Student ${i}`,
        email: `student${i}@test.com`,
        passwordHash: hashedPassword,
        role: ROLES.STUDENT,
        rollNumber: roll,
        isActive: true
      });

      const profile = await StudentProfile.create({
        userId: user._id,
        firstName: `Student`,
        lastName: `${i}`,
        rollNumber: roll,
        departmentId: dept,
        batchYear: 2026,
        currentSemester: 1,
        currentStatus: "ACTIVE",
        residencyType: "DAY_SCHOLAR"
      });
      studentDocs.push(profile);
    }

    // =============================================================
    // 🛡️ ADMIN (With Login Roll Number)
    // =============================================================
    console.log("🛡️ Creating Admin...");
    await User.create({
      name: "System Admin",
      email: "admin@test.com",
      passwordHash: hashedPassword,
      role: ROLES.ADMIN,
      rollNumber: "ADMIN-001", // <--- ADDED THIS
      isActive: true
    });

    console.log("\n✅ SEEDING COMPLETE!");
    process.exit();
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedDatabase();