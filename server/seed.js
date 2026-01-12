/* 🚀 ROBUST SEED SCRIPT (Level-2 Compatible)
  Run with: node seed.js
  
  This script wipes the DB and populates it with:
  - 1 Admin, 1 Faculty, 1 Student
  - 2 Departments (CSE, MECH)
  - 1 Active Semester
  - Courses, Offerings, Enrollments
  - Attendance, Marks, and Announcements
*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 📦 Import ALL Models
const User = require('./models/User');
const Department = require('./models/Department');
const StudentProfile = require('./models/StudentProfile');
const FacultyProfile = require('./models/FacultyProfile');
const Course = require('./models/Course');
const CourseOffering = require('./models/CourseOffering');
const Semester = require('./models/Semester');
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');
const Announcement = require('./models/Announcement');

// 🔌 Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college_portal');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ Database Connection Failed:', err);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log('🧹 Clearing Database...');
  // This prevents "Duplicate Key" errors by starting fresh
  await mongoose.connection.db.dropDatabase();

  try {
    // ============================================
    // 1️⃣ INFRASTRUCTURE (Departments & Semesters)
    // ============================================
    
    // Create Departments
    const deptCSE = await Department.create({ 
        name: 'Computer Science & Engineering', 
        code: 'CSE',
        isActive: true
    });
    
    const deptMECH = await Department.create({ 
        name: 'Mechanical Engineering', 
        code: 'MECH',
        isActive: true
    });
    console.log('🏢 Departments Created');

    // Create Semester
    const currentSemester = await Semester.create({
      name: 'Fall 2025',
      code: '2025-FALL',
      academicYear: '2025-2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-12-15'),
      isActive: true
    });
    console.log('📅 Semester Created');

    // ============================================
    // 2️⃣ USERS (Auth Layer)
    // ============================================
    
    const passwordHash = await bcrypt.hash('password123', 10);

    // A. Admin User
    const adminUser = await User.create({
      name: "Super Admin",
      email: 'admin@college.edu',
      passwordHash,
      role: 'admin',
      rollNumber: "ADM001" // Optional but good for consistency
    });

    // B. Faculty User
    const facultyUser = await User.create({
      name: "Dr. John Smith",
      email: 'smith@college.edu',
      passwordHash,
      role: 'faculty',
      rollNumber: "FAC001"
    });

    // C. Student User
    const studentUser = await User.create({
      name: "Rahul Sharma",
      email: 'rahul@student.edu',
      passwordHash,
      role: 'student',
      rollNumber: "CSE-2025-01" // Must match StudentProfile
    });
    console.log('🔐 Users Created');

    // ============================================
    // 3️⃣ PROFILES (Detailed Layer)
    // ============================================

    // Faculty Profile
    // Note: We manually split name "John" and "Smith" to satisfy schema
    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      departmentId: deptCSE._id,
      firstName: 'John',
      lastName: 'Smith',
      designation: 'Professor',
      qualification: 'Ph.D in AI',
      joiningDate: new Date('2020-01-15'),
      employmentType: 'PERMANENT',
      phone: "9876500001",
      officeLocation: "Block-A, Room 202"
    });

    // Student Profile
    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      departmentId: deptCSE._id,
      firstName: 'Rahul',
      lastName: 'Sharma',
      rollNumber: 'CSE-2025-01', // Matches User
      batchYear: 2025,
      currentSemester: 5,
      guardianDetails: {
        name: 'Mr. Sharma',
        phone: '9876543210'
      },
      currentStatus: "ACTIVE"
    });
    console.log('👤 Profiles Created');

    // ============================================
    // 4️⃣ ACADEMICS (Courses & Offerings)
    // ============================================

    // Course (The Subject)
    const pyCourse = await Course.create({
      name: 'Advanced Python',
      code: 'CS-301',
      credits: 4,
      departmentId: deptCSE._id,
      type: 'CORE',
      isActive: true
    });

    // Offering (The Actual Class)
    // Linked to FacultyProfile (NOT User)
    const pyOffering = await CourseOffering.create({
      courseId: pyCourse._id,
      facultyId: facultyProfile._id,
      semesterId: currentSemester._id,
      section: 'A',
      roomNumber: 'Lab-104',
      capacity: 60
    });
    console.log('📚 Course & Offering Created');

    // ============================================
    // 5️⃣ STUDENT ACTIONS (Enrollment & Activity)
    // ============================================

    // 1. Enrollment
    await Enrollment.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      status: 'ENROLLED',
      enrollmentDate: new Date()
    });

    // 2. Attendance
    // Linked to StudentProfile and markedBy User (Faculty)
    await Attendance.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      date: new Date(), // Today
      status: 'PRESENT',
      markedBy: facultyUser._id // User ID
    });

    // 3. Marks
    // Validated: 42 <= 50 (Passes validation)
    await Marks.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      examType: 'INTERNAL_1',
      marksObtained: 42,
      maxMarks: 50,
      isLocked: false
    });
    console.log('🎓 Enrollment, Attendance & Marks Added');

    // ============================================
    // 6️⃣ ANNOUNCEMENTS
    // ============================================
    await Announcement.create({
      title: 'Welcome to Fall 2025',
      message: 'Classes will begin on August 1st. Please check your schedule.',
      targetAudience: 'ALL',
      createdBy: adminUser._id, // User ID
      isImportant: true,
      departmentId: null // For everyone
    });
    console.log('📢 Announcement Posted');

    console.log('\n🎉 SUCCESS: Database seeded with zero errors!');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    // Log the validation errors specifically if they exist
    if (error.name === 'ValidationError') {
        for (let field in error.errors) {
            console.error(`   -> Field "${field}": ${error.errors[field].message}`);
        }
    }
    process.exit(1);
  }
};

seedData();