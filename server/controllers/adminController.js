const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering");
const Semester = require("../models/Semester");
// ✅ FIX: Import Enrollment model
const Enrollment = require("../models/Enrollment"); 

// =========================================================
// 1. ADD USER (Student or Faculty)
// =========================================================
exports.addUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      rollNumber, batch, qualification 
    } = req.body;
    
    let { departmentId } = req.body;

    // 1. Validate Department
    if (departmentId && !departmentId.match(/^[0-9a-fA-F]{24}$/)) {
        const dept = await Department.findOne({ code: departmentId }); 
        if (!dept) {
            return res.status(400).json({ error: `Invalid Department Code: ${departmentId}` });
        }
        departmentId = dept._id;
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Base User
    const newUser = await User.create({
      name, 
      email, 
      passwordHash: hashedPassword, 
      role, // "student", "faculty", "admin"
      rollNumber,
      isActive: true
    });

    // 4. Create Specific Profile based on Role (With Rollback)
    try {
      if (role.toLowerCase() === "student") {
        
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

        await StudentProfile.create({
          userId: newUser._id,
          departmentId, 
          rollNumber, 
          firstName,      
          lastName,       
          batchYear: batch 
        });

      } else if (role.toLowerCase() === "faculty") {
        await FacultyProfile.create({
          userId: newUser._id,
          departmentId,
          qualification
        });
      }
    } catch (profileError) {
      // 🛑 ROLLBACK: Delete the user if profile creation fails
      console.error("Profile creation failed, rolling back user:", profileError.message);
      await User.findByIdAndDelete(newUser._id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Add User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. ADD DEPARTMENT
// =========================================================
exports.addDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    console.error("Add Dept Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. ADD COURSE (Subject)
// =========================================================
exports.addCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    console.error("Add Course Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 4. ASSIGN FACULTY TO COURSE
// =========================================================
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId } = req.body;
    
    // ✅ FIX: Find the currently ACTIVE semester
    const activeSemester = await Semester.findOne({ isActive: true });
    if (!activeSemester) {
        return res.status(400).json({ error: "No Active Semester found. Please create one first." });
    }

    // Check if assignment already exists for THIS semester
    const existing = await CourseOffering.findOne({ 
        facultyId, 
        courseId,
        semesterId: activeSemester._id 
    });

    if (existing) {
        return res.status(400).json({ message: "Faculty is already assigned to this course this semester." });
    }

    // ✅ FIX: Create the link with the Semester ID
    await CourseOffering.create({ 
        facultyId, 
        courseId,
        semesterId: activeSemester._id 
    });
    
    res.status(200).json({ message: "Faculty assigned to course successfully" });
  } catch (err) {
    console.error("Assign Faculty Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 5. ENROLL STUDENT IN A COURSE
// =========================================================
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseOfferingId } = req.body;

    // Check if already enrolled
    const existing = await Enrollment.findOne({ studentId, courseOfferingId });
    if (existing) {
      return res.status(400).json({ message: "Student already enrolled in this class" });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseOfferingId,
      status: "ENROLLED"
    });

    res.status(201).json({ message: "Student Enrolled Successfully", enrollment });
  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 6. Broadcast Notice to ALL Students
// =========================================================
exports.broadcastNotice = async (req, res) => {
  try {
    const { title, message } = req.body;

    const io = req.app.get("socketio");

    io.to("Physics_Class").emit("receive_notice", {
      title: title,
      message: message,
      time: new Date().toLocaleTimeString()
    });

    res.json({ message: "📢 Notice Broadcasted Successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send notice" });
  }
};