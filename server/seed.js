/* 🚀 FINAL MASTER SEED SCRIPT
   Run with: node seed.js
   
   Features:
   1. Wipes the database clean.
   2. Creates YOUR Admin account (vikaskushwaha5424@gmail.com).
   3. Creates Dummy Data (Faculty, Student, Courses, Marks) so the app isn't empty.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 📦 Import ALL Models
// Make sure these paths match your actual folder structure!
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

// 👇👇👇 YOUR REAL ADMIN LOGIN 👇👇👇
const MY_REAL_EMAIL = "vikaskushwaha5424@gmail.com"; 
const COMMON_PASSWORD = "password123";

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
  await mongoose.connection.db.dropDatabase();

  try {
    const passwordHash = await bcrypt.hash(COMMON_PASSWORD, 10);

    // ============================================
    // 1️⃣ INFRASTRUCTURE
    // ============================================
    const deptCSE = await Department.create({ name: 'Computer Science', code: 'CSE', isActive: true });
    const deptMECH = await Department.create({ name: 'Mechanical', code: 'MECH', isActive: true });
    
    const currentSemester = await Semester.create({
      name: 'Fall 2025',
      code: '2025-FALL',
      academicYear: '2025-2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-12-15'),
      isActive: true
    });
    console.log('🏢 Infrastructure Created (Depts & Semester)');

    // ============================================
    // 2️⃣ USERS (The Login Layer)
    // ============================================
    
    // 👑 A. YOUR ADMIN ACCOUNT
    const adminUser = await User.create({
      name: "Vikas Admin",
      email: MY_REAL_EMAIL,  // <--- You can login with this!
      passwordHash,
      role: 'admin',
      rollNumber: "ADMIN-001",
      isActive: true
    });

    // 👨‍🏫 B. Dummy Faculty
    const facultyUser = await User.create({
      name: "Dr. John Smith",
      email: 'smith@college.edu',
      passwordHash,
      role: 'faculty',
      rollNumber: "FAC001",
      isActive: true
    });

    // 👨‍🎓 C. Dummy Student
    const studentUser = await User.create({
      name: "Rahul Student",
      email: 'student@college.edu',
      passwordHash,
      role: 'student',
      rollNumber: "CSE-2025-01",
      isActive: true
    });
    console.log(`🔐 Users Created. Admin Login: ${MY_REAL_EMAIL} / ${COMMON_PASSWORD}`);

    // ============================================
    // 3️⃣ PROFILES (The Details Layer)
    // ============================================

    // Faculty Profile
    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      departmentId: deptCSE._id,
      firstName: 'John',
      lastName: 'Smith',
      designation: 'Professor',
      qualification: 'Ph.D in AI',
      joiningDate: new Date('2020-01-15'),
      employmentType: 'PERMANENT',
      phone: "9876500001"
    });

    // Student Profile
    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      departmentId: deptCSE._id,
      firstName: 'Rahul',
      lastName: 'Student',
      rollNumber: 'CSE-2025-01',
      batchYear: 2025,
      currentSemester: 5,
      currentStatus: "ACTIVE"
    });

    // ============================================
    // 4️⃣ ACADEMICS (Courses & Offerings)
    // ============================================
    
    const pyCourse = await Course.create({
      name: 'Advanced Python',
      code: 'CS-301',
      credits: 4,
      departmentId: deptCSE._id,
      type: 'CORE',
      isActive: true
    });

    const pyOffering = await CourseOffering.create({
      courseId: pyCourse._id,
      facultyId: facultyProfile._id,
      semesterId: currentSemester._id,
      section: 'A',
      roomNumber: 'Lab-104',
      capacity: 60
    });

    // ============================================
    // 5️⃣ ACTIONS (Enrollment, Marks, etc.)
    // ============================================

    // Enroll Student
    await Enrollment.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      status: 'ENROLLED',
      enrollmentDate: new Date()
    });

    // Give Marks (So you can see data in dashboard)
    await Marks.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      examType: 'INTERNAL_1',
      marksObtained: 42,
      maxMarks: 50,
      isLocked: false
    });

    // Post Announcement
    await Announcement.create({
      title: 'Welcome to the Portal',
      message: 'The admin has successfully seeded the database.',
      targetAudience: 'ALL',
      createdBy: adminUser._id,
      isImportant: true
    });

    console.log('🎉 SUCCESS: Database fully seeded!');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    if (error.name === 'ValidationError') {
       for (let field in error.errors) {
           console.error(` -> ${field}: ${error.errors[field].message}`);
       }
    }
    process.exit(1);
  }
};

seedData();