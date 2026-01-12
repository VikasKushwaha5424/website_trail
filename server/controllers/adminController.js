const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering"); 

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

    // 1. Validate Department (Convert Code like "CSE" to ObjectId if needed)
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

    // 4. Create Specific Profile based on Role
    // We lowercase the role to be safe (e.g. "Student" -> "student")
    if (role.toLowerCase() === "student") {
      
      // CRITICAL FIX: Split full name into First/Last name for StudentProfile schema
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

      await StudentProfile.create({
        userId: newUser._id,
        departmentId, 
        rollNumber, 
        firstName,      // ✅ REQUIRED by Schema
        lastName,       // ✅ REQUIRED by Schema
        batchYear: batch // ✅ REQUIRED by Schema (maps 'batch' from input to 'batchYear')
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
    // Note: ensure your schema has facultyId, courseId, semesterId. 
    // If you need semesterId, make sure to pass it in req.body or handle it here.
    // For now, adhering to your provided snippet:
    await CourseOffering.create({ facultyId, courseId });
    
    res.status(200).json({ message: "Faculty assigned to course successfully" });
  } catch (err) {
    console.error("Assign Faculty Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 🚀 LEVEL 4: Broadcast Notice to ALL Students
// =========================================================
exports.broadcastNotice = async (req, res) => {
  try {
    const { title, message } = req.body;

    // 1. Get the Socket.io instance (we saved this in index.js)
    const io = req.app.get("socketio");

    // 2. Send to "Physics_Class" room (or use io.emit to send to EVERYONE)
    // For this test, we send to the room our test script joined
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