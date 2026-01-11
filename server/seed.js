/* 🚀 LEVEL-2 SEED SCRIPT
  Run with: node seed.js
*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 📦 Import ALL your new models
const User = require('./models/User');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Semester = require('./models/Semester');
const FacultyProfile = require('./models/FacultyProfile');
const StudentProfile = require('./models/StudentProfile');
const CourseOffering = require('./models/CourseOffering');
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');
const Announcement = require('./models/Announcement');

// 🔌 Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college_portal');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ Database Connection Failed', err);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log('🧹 Clearing Database...');
  await mongoose.connection.db.dropDatabase();

  try {
    // ============================================
    // 1️⃣ INFRASTRUCTURE (Departments & Semesters)
    // ============================================
    
    // Create Departments
    const deptCSE = await Department.create({ name: 'Computer Science', code: 'CSE' });
    const deptMECH = await Department.create({ name: 'Mechanical Eng.', code: 'MECH' });
    console.log('🏢 Departments Created');

    // Create Semester (The "Time" Context)
    const currentSemester = await Semester.create({
      name: 'Fall 2025',
      code: '2025-FALL',
      academicYear: '2025-2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-12-15')
    });
    console.log('📅 Semester Created');

    // ============================================
    // 2️⃣ AUTHENTICATION (Users)
    // ============================================
    
    const passwordHash = await bcrypt.hash('password123', 10);

    // Admin User
    const adminUser = await User.create({
      username: 'ADMIN01',
      email: 'admin@college.edu',
      passwordHash,
      role: 'ADMIN'
    });

    // Faculty User (Prof. Smith)
    const facultyUser = await User.create({
      username: 'FAC001',
      email: 'smith@college.edu',
      passwordHash,
      role: 'FACULTY'
    });

    // Student User (Vikas)
    const studentUser = await User.create({
      username: 'CSE2025001', // Roll Number as Username
      email: 'vikas@student.edu',
      passwordHash,
      role: 'STUDENT'
    });
    console.log('🔐 Users Created');

    // ============================================
    // 3️⃣ PROFILES (Personal Data)
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
      employmentType: 'PERMANENT'
    });

    // Student Profile
    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      departmentId: deptCSE._id,
      firstName: 'Vikas',
      lastName: 'Kushwaha',
      rollNumber: 'CSE2025001',
      batchYear: 2025,
      currentSemester: 5,
      guardianDetails: {
        name: 'Mr. Kushwaha',
        phone: '9876543210'
      }
    });
    console.log('👤 Profiles Created');

    // ============================================
    // 4️⃣ ACADEMICS (Courses & Offerings)
    // ============================================

    // Define the Course (Catalog)
    const pyCourse = await Course.create({
      name: 'Advanced Python',
      code: 'CS-301',
      credits: 4,
      departmentId: deptCSE._id,
      type: 'CORE'
    });

    // Create the Offering (Real Class)
    // "Prof. Smith teaches Advanced Python in Fall 2025"
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
    // 5️⃣ STUDENT ACTIONS (Enrollment, Attendance, Marks)
    // ============================================

    // 1. Enroll Vikas in Python
    await Enrollment.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      status: 'ENROLLED'
    });

    // 2. Mark Attendance for Today
    await Attendance.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      date: new Date(),
      status: 'PRESENT',
      markedBy: facultyUser._id
    });

    // 3. Upload Marks (Internal 1)
    await Marks.create({
      studentId: studentProfile._id,
      courseOfferingId: pyOffering._id,
      examType: 'INTERNAL_1',
      marksObtained: 42,
      maxMarks: 50
    });
    console.log('🎓 Enrollment, Attendance & Marks Added');

    // ============================================
    // 6️⃣ COMMUNICATION (Announcements)
    // ============================================
    await Announcement.create({
      title: 'Mid-Sem Exams Postponed',
      message: 'Due to heavy rains, exams are shifted by 2 days.',
      targetAudience: 'ALL',
      createdBy: adminUser._id,
      isImportant: true
    });
    console.log('📢 Announcement Posted');

    console.log('\n🎉 SUCCESS: Level-2 Database Seeded Successfully!');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();