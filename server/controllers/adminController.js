const User = require("../models/User");
const Student = require("../models/Student");
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const FacultyCourse = require("../models/FacultyCourse");
const bcrypt = require("bcryptjs"); // Ensure you have: npm install bcryptjs

// 1. ADD USER
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
        const dept = await Department.findOne({ code: departmentId }); // or { name: departmentId }
        if (!dept) {
            return res.status(400).json({ error: `Invalid Department Code: ${departmentId}` });
        }
        departmentId = dept._id;
    }

    // 2. Hash Password (Optional: Remove if User Model handles this)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    const newUser = await User.create({
      name, 
      email, 
      passwordHash: hashedPassword, 
      role,
      rollNumber 
    });

    // 4. Create Specific Profile
    if (role === "Student") {
      await Student.create({
        userId: newUser._id,
        departmentId, 
        rollNo: rollNumber,
        batch
      });
    } else if (role === "Faculty") {
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

// ... (Rest of the controller functions: addDepartment, addCourse, assignFaculty remain the same)
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
    await FacultyCourse.create({ facultyId, courseId });
    res.status(200).json({ message: "Faculty assigned to course" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};