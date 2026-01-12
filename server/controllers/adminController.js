const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering");
const Semester = require("../models/Semester");
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
// 4. ASSIGN FACULTY TO COURSE (Safe Version)
// =========================================================
exports.assignFaculty = async (req, res) => {
  try {
    // 1. Accept semesterId optionally (for manual override)
    const { facultyId, courseId, semesterId } = req.body;
    
    let targetSemesterId = semesterId;

    // 2. If no ID provided, find the system's current active semester safely
    if (!targetSemesterId) {
        const activeSemesters = await Semester.find({ isActive: true });

        if (activeSemesters.length === 0) {
            return res.status(400).json({ error: "No Active Semester found. Please create one first." });
        }

        // 🛡️ SAFETY CHECK: Prevent ambiguity if multiple semesters are accidentally active
        if (activeSemesters.length > 1) {
            return res.status(500).json({ 
                error: "System Error: Multiple Active Semesters detected. Please specify 'semesterId' explicitly or fix database." 
            });
        }

        targetSemesterId = activeSemesters[0]._id;
    }

    // 3. Check if assignment already exists for THIS semester
    const existing = await CourseOffering.findOne({ 
        facultyId, 
        courseId,
        semesterId: targetSemesterId 
    });

    if (existing) {
        return res.status(400).json({ message: "Faculty is already assigned to this course for the selected semester." });
    }

    // 4. Create the assignment
    await CourseOffering.create({ 
        facultyId, 
        courseId,
        semesterId: targetSemesterId 
    });
    
    res.status(200).json({ message: "Faculty assigned to course successfully" });
  } catch (err) {
    console.error("Assign Faculty Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 5. ENROLL STUDENT IN A COURSE (With Capacity Check)
// =========================================================
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseOfferingId } = req.body;

    // 1. Check if already enrolled
    const existing = await Enrollment.findOne({ studentId, courseOfferingId });
    if (existing) {
      return res.status(400).json({ message: "Student already enrolled in this class" });
    }

    // ✅ FIX: Check Capacity vs Current Enrollments
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ message: "Course Offering not found" });

    const currentCount = await Enrollment.countDocuments({ courseOfferingId });
    
    if (currentCount >= offering.capacity) {
        return res.status(400).json({ error: `Class is Full! Capacity: ${offering.capacity}` });
    }

    // 2. Create Enrollment
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
// 6. Broadcast Notice (Global OR Targeted)
// =========================================================
exports.broadcastNotice = async (req, res) => {
  try {
    // Extract 'target' from the request (e.g., "CSE-Semester-1" or "ALL")
    const { title, message, target } = req.body;

    const io = req.app.get("socketio");

    // Check if a specific target room is provided
    if (target && target !== "ALL") {
        // 🎯 OPTION 1: Send to Specific Class/Room only
        io.to(target).emit("receive_notice", {
            title: title,
            message: message,
            target: target, // Optional: Let client know it was targeted
            time: new Date().toLocaleTimeString()
        });
        console.log(`📢 Notice sent to room: ${target}`);
    } else {
        // 🌍 OPTION 2: Send to EVERYONE (Global Broadcast)
        io.emit("receive_notice", {
            title: title,
            message: message,
            target: "ALL",
            time: new Date().toLocaleTimeString()
        });
        console.log(`📢 Global notice sent to all users`);
    }

    res.json({ message: "📢 Notice Broadcasted Successfully!" });

  } catch (err) {
    console.error("Broadcast Error:", err);
    res.status(500).json({ error: "Failed to send notice" });
  }
};

// =========================================================
// 7. CREATE SEMESTER (Handles "Single Active" Rule + Validation)
// =========================================================
exports.createSemester = async (req, res) => {
  try {
    const { name, code, academicYear, startDate, endDate, isActive } = req.body;

    // ✅ FIX: Validate Dates
    // Ensure Start Date is physically before End Date to prevent logical errors
    if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ error: "Start Date must be before End Date" });
    }

    // 1. If this new semester is set to ACTIVE, deactivate ALL others first
    if (isActive === true) {
        await Semester.updateMany({}, { isActive: false });
    }

    // 2. Create the new Semester
    const semester = await Semester.create({
        name,
        code,
        academicYear,
        startDate,
        endDate,
        isActive // If true, it is now the ONLY active one
    });

    res.status(201).json({ message: "Semester Created Successfully", semester });

  } catch (err) {
    console.error("Create Semester Error:", err);
    res.status(500).json({ error: err.message });
  }
};