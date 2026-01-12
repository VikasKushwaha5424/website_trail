const mongoose = require("mongoose");
const User = require("./models/User");
const StudentProfile = require("./models/StudentProfile");
const Course = require("./models/Course");
const Department = require("./models/Department");
const Semester = require("./models/Semester");
const CourseOffering = require("./models/CourseOffering");
const Marks = require("./models/Marks");
const { calculateSGPA } = require("./utils/gpaService");
require("dotenv").config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected for Test"))
  .catch(err => console.error(err));

const runTest = async () => {
  try {
    console.log("🚀 Setting up Test Data...");

    // 1. Create a Department
    const dept = await Department.findOneAndUpdate(
      { code: "ROBO" },
      { name: "Robotics", code: "ROBO" },
      { upsert: true, new: true }
    );

    // 2. Create a Semester
    const sem = await Semester.findOneAndUpdate(
        { code: "FALL-25" },
        { 
            name: "Fall 2025", 
            code: "FALL-25", 
            academicYear: "2025-2026", 
            startDate: new Date(), 
            endDate: new Date() 
        },
        { upsert: true, new: true }
    );

    // 3. Create a Course (Credits = 4)
    const course = await Course.create({
      name: `Intro to AI ${Date.now()}`,
      code: `AI-${Date.now()}`,
      credits: 4,
      departmentId: dept._id
    });

    // 4. Create a Student (FIXED: role is now lowercase "student")
    const user = await User.create({ 
        name: "Genius Student", 
        email: `genius${Date.now()}@test.com`, 
        passwordHash: "123", 
        role: "student" 
    });
    
    const student = await StudentProfile.create({ 
        userId: user._id, 
        firstName: "Tony", 
        lastName: "Stark", 
        rollNumber: `TS-${Date.now()}`, 
        departmentId: dept._id, 
        batchYear: 2025 
    });

    // 5. Create an Offering (Class)
    const offering = await CourseOffering.create({
        courseId: course._id,
        facultyId: new mongoose.Types.ObjectId(), // Fake Faculty ID
        semesterId: sem._id
    });

    // 6. Give Marks! 
    console.log("📝 Assigning Marks...");
    // Internal Exam: 25/30
    await Marks.create({ 
        studentId: student._id, 
        courseOfferingId: offering._id, 
        examType: "INTERNAL_1", 
        maxMarks: 30, 
        marksObtained: 25 
    });
    // Final Exam: 65/70
    await Marks.create({ 
        studentId: student._id, 
        courseOfferingId: offering._id, 
        examType: "FINAL", 
        maxMarks: 70, 
        marksObtained: 65 
    });

    console.log("🧮 Running Calculation Engine...");
    
    // 7. RUN THE ENGINE
    await calculateSGPA(student._id);

    console.log("✅ Test Complete! (Check output above)");
    
  } catch (err) {
    console.error("❌ Test Failed:", err);
  } finally {
    mongoose.connection.close();
  }
};

runTest();