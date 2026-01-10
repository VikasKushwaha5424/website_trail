const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load Models
const User = require("./models/User");
const Department = require("./models/Department");
const Course = require("./models/Course");
const Student = require("./models/Student");
const FacultyProfile = require("./models/FacultyProfile");
const FacultyCourse = require("./models/FacultyCourse");
const Enrollment = require("./models/Enrollment");
const Attendance = require("./models/Attendance");
const Marks = require("./models/Marks");

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    console.log("🔴 Clearing existing data...");
    await User.deleteMany();
    await Department.deleteMany();
    await Course.deleteMany();
    await Student.deleteMany();
    await FacultyProfile.deleteMany();
    await FacultyCourse.deleteMany();
    await Enrollment.deleteMany();
    await Attendance.deleteMany();
    await Marks.deleteMany();
    console.log("✅ Data cleared.");

    // -----------------------------------------
    // 1. DEPARTMENTS
    // -----------------------------------------
    const depts = await Department.create([
      { departmentName: "Computer Science", departmentCode: "CSE" },
      { departmentName: "Electronics", departmentCode: "ECE" },
      { departmentName: "Mechanical", departmentCode: "MECH" },
    ]);
    const cseId = depts[0]._id;
    const eceId = depts[1]._id;

    console.log(`✅ Created ${depts.length} Departments`);

    // -----------------------------------------
    // 2. COURSES
    // -----------------------------------------
    const courses = await Course.create([
      { subjectCode: "CS101", subjectName: "Data Structures", semester: 3, credits: 4, academicYear: "2025-2026" },
      { subjectCode: "CS102", subjectName: "Database Systems", semester: 3, credits: 3, academicYear: "2025-2026" },
      { subjectCode: "EC201", subjectName: "Circuit Theory", semester: 3, credits: 4, academicYear: "2025-2026" },
    ]);
    console.log(`✅ Created ${courses.length} Courses`);

    // -----------------------------------------
    // 3. USERS (Admin, Faculty, Students)
    // -----------------------------------------
    // Password is "123456" for everyone for easy testing
    const users = await User.create([
      // Admin
      { rollNumber: "ADMIN01", name: "Super Admin", email: "admin@college.com", passwordHash: "123456", role: "Admin" },
      
      // Faculty (3 Teachers)
      { rollNumber: "FAC001", name: "Dr. Alan Turing", email: "alan@college.com", passwordHash: "123456", role: "Faculty" },
      { rollNumber: "FAC002", name: "Dr. Grace Hopper", email: "grace@college.com", passwordHash: "123456", role: "Faculty" },
      { rollNumber: "FAC003", name: "Dr. Nikola Tesla", email: "tesla@college.com", passwordHash: "123456", role: "Faculty" },

      // Students (5 Students)
      { rollNumber: "STU001", name: "John Doe", email: "john@student.com", passwordHash: "123456", role: "Student" },
      { rollNumber: "STU002", name: "Jane Smith", email: "jane@student.com", passwordHash: "123456", role: "Student" },
      { rollNumber: "STU003", name: "Mike Ross", email: "mike@student.com", passwordHash: "123456", role: "Student" },
      { rollNumber: "STU004", name: "Rachel Green", email: "rachel@student.com", passwordHash: "123456", role: "Student" },
      { rollNumber: "STU005", name: "Monica Geller", email: "monica@student.com", passwordHash: "123456", role: "Student" },
    ]);
    console.log(`✅ Created ${users.length} Users`);

    // Separate Users by Role for easier linking
    const facultyUsers = users.filter(u => u.role === "Faculty");
    const studentUsers = users.filter(u => u.role === "Student");

    // -----------------------------------------
    // 4. PROFILES (Faculty & Students)
    // -----------------------------------------
    
    // Create Faculty Profiles
    const facultyProfiles = await FacultyProfile.create([
      { userId: facultyUsers[0]._id, departmentId: cseId, qualification: "PhD in AI", experience: 10 },
      { userId: facultyUsers[1]._id, departmentId: cseId, qualification: "M.Tech CSE", experience: 5 },
      { userId: facultyUsers[2]._id, departmentId: eceId, qualification: "PhD Physics", experience: 15 },
    ]);

    // Create Student Profiles
    const studentProfiles = await Student.create([
      { userId: studentUsers[0]._id, rollNo: "STU001", departmentId: cseId, batch: "2022-2026", semester: 3 },
      { userId: studentUsers[1]._id, rollNo: "STU002", departmentId: cseId, batch: "2022-2026", semester: 3 },
      { userId: studentUsers[2]._id, rollNo: "STU003", departmentId: cseId, batch: "2022-2026", semester: 3 },
      { userId: studentUsers[3]._id, rollNo: "STU004", departmentId: eceId, batch: "2022-2026", semester: 3 },
      { userId: studentUsers[4]._id, rollNo: "STU005", departmentId: eceId, batch: "2022-2026", semester: 3 },
    ]);
    console.log("✅ Created Profiles");

    // -----------------------------------------
    // 5. ASSIGNMENTS (Who teaches what?)
    // -----------------------------------------
    // Faculty 1 teaches Course 1
    await FacultyCourse.create({ facultyId: facultyProfiles[0]._id, courseId: courses[0]._id });
    // Faculty 2 teaches Course 2
    await FacultyCourse.create({ facultyId: facultyProfiles[1]._id, courseId: courses[1]._id });

    // -----------------------------------------
    // 6. ENROLLMENTS (Who studies what?)
    // -----------------------------------------
    // All CSE students take Data Structures (Course 0)
    await Enrollment.create([
      { studentId: studentProfiles[0]._id, courseId: courses[0]._id },
      { studentId: studentProfiles[1]._id, courseId: courses[0]._id },
      { studentId: studentProfiles[2]._id, courseId: courses[0]._id },
    ]);
    console.log("✅ Created Enrollments");

    // -----------------------------------------
    // 7. ATTENDANCE & MARKS (Dummy Data)
    // -----------------------------------------
    // Mark attendance for Student 1 in Course 1
    await Attendance.create([
      { studentId: studentProfiles[0]._id, courseId: courses[0]._id, date: new Date(), status: "Present", markedBy: facultyProfiles[0]._id },
      { studentId: studentProfiles[0]._id, courseId: courses[0]._id, date: new Date(Date.now() - 86400000), status: "Absent", markedBy: facultyProfiles[0]._id },
    ]);

    // Give marks to Student 1 in Course 1
    await Marks.create({
      studentId: studentProfiles[0]._id,
      courseId: courses[0]._id,
      examType: "Internal 1",
      marksObtained: 45,
      maxMarks: 50
    });

    console.log("✅ Created Dummy Attendance & Marks");
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();