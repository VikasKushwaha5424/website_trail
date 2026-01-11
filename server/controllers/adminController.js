const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering"); 

// 1. ADD USER
exports.addUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      rollNumber, batch, qualification 
    } = req.body;
    
    let { departmentId } = req.body;

    // Validate Department
    if (departmentId && !departmentId.match(/^[0-9a-fA-F]{24}$/)) {
        const dept = await Department.findOne({ code: departmentId }); 
        if (!dept) return res.status(400).json({ error: `Invalid Department Code: ${departmentId}` });
        departmentId = dept._id;
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Base User
    const newUser = await User.create({
      name, 
      email, 
      passwordHash: hashedPassword, 
      role, 
      rollNumber,
      isActive: true
    });

    // 👇 FIXED: Create Specific Profile
    if (role.toLowerCase() === "student") {
      // 1. Split Full Name into First/Last
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

      await StudentProfile.create({
        userId: newUser._id,
        departmentId, 
        rollNumber, 
        firstName, // FIXED: Required by Schema
        lastName,  // FIXED: Required by Schema
        batchYear: batch // FIXED: Schema uses 'batchYear', not 'batch'
      });
    } else if (role.toLowerCase() === "faculty") {
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

// ... (Rest of the file remains the same: addDepartment, addCourse, assignFaculty)
// You can keep the existing code for the other functions below.
exports.addDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId } = req.body;
    const existing = await CourseOffering.findOne({ facultyId, courseId });
    if (existing) return res.status(400).json({ message: "Faculty is already assigned." });
    await CourseOffering.create({ facultyId, courseId });
    res.status(200).json({ message: "Faculty assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};