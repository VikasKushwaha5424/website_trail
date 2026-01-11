const User = require("../models/User");
const Student = require("../models/Student");
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const FacultyCourse = require("../models/FacultyCourse");

// 1. ADD USER (Generic: Handles Student, Faculty, or Admin)
exports.addUser = async (req, res) => {
  try {
    // ✅ FIX: Destructure all fields directly from req.body (matches Frontend flat structure)
    const { 
      name, 
      email, 
      password, 
      role, 
      departmentId, 
      rollNumber, 
      batch,       // Direct access (was specificData.batch)
      qualification // Direct access (was specificData.qualification)
    } = req.body;
    
    // 1. Create the Login User
    const newUser = await User.create({
      name, 
      email, 
      passwordHash: password, 
      role,
      rollNumber 
    });

    // 2. If 'Student', create Student Profile
    if (role === "Student") {
      await Student.create({
        userId: newUser._id,
        departmentId, // Ensure this is a valid ObjectId if your Schema requires it
        rollNo: rollNumber,
        batch: batch // Usage of flattened variable
      });
    }

    // 3. If 'Faculty', create Faculty Profile
    if (role === "Faculty") {
      await FacultyProfile.create({
        userId: newUser._id,
        departmentId,
        qualification: qualification // Usage of flattened variable
      });
    }

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Add User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. ADD DEPARTMENT
exports.addDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. ADD COURSE
exports.addCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. ASSIGN FACULTY TO COURSE
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId } = req.body;
    await FacultyCourse.create({ facultyId, courseId });
    res.status(200).json({ message: "Faculty assigned to course" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};