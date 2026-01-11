const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering"); // FIXED: Was FacultyCourse

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

    // 1. Handle Department ID (Convert "CSE" -> ObjectId if necessary)
    if (departmentId && !departmentId.match(/^[0-9a-fA-F]{24}$/)) {
        // If it's NOT a valid ObjectId (e.g., it is "CSE"), lookup the ID
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
    // Note: ensure your User model schema expects 'passwordHash'
    const newUser = await User.create({
      name, 
      email, 
      passwordHash: hashedPassword, 
      role, // "student", "faculty", "admin"
      rollNumber,
      isActive: true
    });

    // 4. Create Specific Profile based on Role
    if (role === "student" || role === "Student") {
      await StudentProfile.create({
        userId: newUser._id,
        departmentId, 
        rollNumber, // Ensure schema uses 'rollNumber', not 'rollNo'
        batch
      });
    } else if (role === "faculty" || role === "Faculty") {
      await FacultyProfile.create({
        userId: newUser._id,
        departmentId,
        qualification
      });
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
    
    // Check if assignment already exists to prevent duplicates
    const existing = await CourseOffering.findOne({ facultyId, courseId });
    if (existing) {
        return res.status(400).json({ message: "Faculty is already assigned to this course." });
    }

    // Create the link in CourseOffering collection
    await CourseOffering.create({ facultyId, courseId });
    
    res.status(200).json({ message: "Faculty assigned to course successfully" });
  } catch (err) {
    console.error("Assign Faculty Error:", err);
    res.status(500).json({ error: err.message });
  }
};