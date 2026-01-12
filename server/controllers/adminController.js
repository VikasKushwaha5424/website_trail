const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering");
const Semester = require("../models/Semester");
const Enrollment = require("../models/Enrollment");
const Announcement = require("../models/Announcement"); // ✅ Added Import for saving notices
const sendEmail = require("../utils/emailService");

// =========================================================
// 1. ADD USER (Robust: Handles Student/Faculty + Rollback)
// =========================================================
exports.addUser = async (req, res) => {
  let user = null; // Declare outside 'try' for rollback scope

  try {
    const { 
      name, email, password, role, 
      rollNumber, batchYear, qualification, designation 
    } = req.body;
    
    let { departmentId } = req.body;

    // 1. Validate Department (Helper to convert Code -> ID if needed)
    if (departmentId && !departmentId.match(/^[0-9a-fA-F]{24}$/)) {
        const dept = await Department.findOne({ code: departmentId }); 
        if (!dept) {
            return res.status(400).json({ error: `Invalid Department Code: ${departmentId}` });
        }
        departmentId = dept._id;
    }

    // 2. Check if user exists
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists with this email" });

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create Base User (Point of No Return)
    user = await User.create({
      name, 
      email, 
      passwordHash: hashedPassword, 
      role, // "student", "faculty", "admin"
      rollNumber: rollNumber || undefined,
      isActive: true
    });

    // 5. Create Specific Profile based on Role
    // ⚠️ CRITICAL: If this fails, we catch it and delete the 'user'
    try {
      if (role.toLowerCase() === "student") {
        
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        await StudentProfile.create({
          userId: user._id,
          departmentId: departmentId || null, // Can be null initially
          rollNumber: rollNumber || "TEMP-" + Date.now(), 
          firstName,      
          lastName,       
          batchYear: batchYear || new Date().getFullYear(),
          currentStatus: "ACTIVE"
        });

      } else if (role.toLowerCase() === "faculty") {
        if (!departmentId) {
             throw new Error("Department ID is required for Faculty");
        }
        await FacultyProfile.create({
          userId: user._id,
          departmentId,
          qualification,
          designation: designation || "Assistant Professor"
        });
      }
    } catch (profileError) {
      throw profileError; // Throw to the main catch block to trigger rollback
    }

    // 6. Send Credentials via Email
    try {
        await sendEmail(email, "Account Created", `
            <h1>Welcome to the Portal</h1>
            <p>Your account has been created by the administrator.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please login and change your password immediately.</p>
        `);
    } catch (emailErr) {
        console.error("Warning: Failed to send credential email:", emailErr.message);
    }

    res.status(201).json({ message: "User created successfully", user });

  } catch (err) {
    console.error("Add User Error:", err);

    // 🛑 ROLLBACK: Delete the user if profile creation failed
    if (user && user._id) {
        console.log(`Rolling back creation for user: ${user._id}`);
        await User.findByIdAndDelete(user._id);
    }

    res.status(500).json({ error: err.message || "Failed to add user" });
  }
};

// =========================================================
// 2. ADD DEPARTMENT
// =========================================================
exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    const dept = await Department.create({ name, code });
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
    const { name, code, credits, departmentId } = req.body;
    const course = await Course.create({ name, code, credits, departmentId });
    res.status(201).json(course);
  } catch (err) {
    console.error("Add Course Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 4. CREATE SEMESTER (Handles "Single Active" Rule)
// =========================================================
exports.createSemester = async (req, res) => {
  try {
    const { name, code, academicYear, startDate, endDate, isActive } = req.body;

    // Validate Dates
    if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ error: "Start Date must be before End Date" });
    }

    // If this new semester is set to ACTIVE, deactivate ALL others first
    if (isActive === true) {
        await Semester.updateMany({}, { isActive: false });
    }

    const semester = await Semester.create({
        name, code, academicYear, startDate, endDate, isActive
    });

    res.status(201).json({ message: "Semester Created Successfully", semester });

  } catch (err) {
    console.error("Create Semester Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 5. ASSIGN FACULTY TO COURSE (Race-Condition Free)
// =========================================================
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId, semesterId } = req.body;
    
    let targetSemesterId = semesterId;

    // If no ID provided, find the system's current active semester
    if (!targetSemesterId) {
        const activeSemesters = await Semester.find({ isActive: true });

        if (activeSemesters.length === 0) {
            return res.status(400).json({ error: "No Active Semester found. Please create one first." });
        }
        // If multiple active (edge case), pick the first one
        targetSemesterId = activeSemesters[0]._id;
    }

    // Create the assignment
    // (Ensure you have a unique compound index on { facultyId, courseId, semesterId } in your Model)
    await CourseOffering.create({ 
        facultyId, 
        courseId,
        semesterId: targetSemesterId 
    });
    
    res.status(200).json({ message: "Faculty assigned to course successfully" });

  } catch (err) {
    // 🛡️ RACE CONDITION HANDLER (Duplicate Entry)
    if (err.code === 11000) {
        return res.status(400).json({ 
            message: "Faculty is already assigned to this course for the selected semester." 
        });
    }
    console.error("Assign Faculty Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 6. ENROLL STUDENT IN A COURSE (Atomic & Safe)
// =========================================================
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseOfferingId } = req.body;

    // 1. Prevent Duplicate Enrollment
    const existingEnrollment = await Enrollment.findOne({ studentId, courseOfferingId });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Student is already enrolled in this class." });
    }

    // 2. ATOMIC CAPACITY CHECK & RESERVATION
    // Only update if currentEnrollment < capacity
    const offering = await CourseOffering.findOneAndUpdate(
      { 
        _id: courseOfferingId, 
        $expr: { $lt: ["$currentEnrollment", "$capacity"] } 
      },
      { $inc: { currentEnrollment: 1 } },
      { new: true }
    );

    if (!offering) {
        // Double check if course exists to give better error
        const checkExists = await CourseOffering.findById(courseOfferingId);
        if (!checkExists) return res.status(404).json({ message: "Course Offering not found" });
        
        return res.status(400).json({ message: `Enrollment Failed: Class is Full (Capacity: ${checkExists.capacity})` });
    }

    // 3. Create Enrollment Record
    try {
        const enrollment = await Enrollment.create({
          studentId,
          courseOfferingId,
          status: "ENROLLED"
        });

        res.status(201).json({ message: "Student Enrolled Successfully", enrollment });

    } catch (enrollError) {
        // 🛑 ROLLBACK: Release the reserved spot if insert fails
        console.error("Enrollment creation failed. Rolling back capacity...", enrollError);
        await CourseOffering.findByIdAndUpdate(courseOfferingId, { $inc: { currentEnrollment: -1 } });
        
        if (enrollError.code === 11000) {
            return res.status(400).json({ message: "Student is already enrolled in this class." });
        }
        throw enrollError;
    }

  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 7. BROADCAST NOTICE (Targeted + Saved to DB)
// =========================================================
exports.broadcastNotice = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    // A. SAVE TO DATABASE (So it shows up in the Student Dashboard later)
    await Announcement.create({
        title,
        content: message,
        targetAudience: target || "ALL",
        date: new Date()
    });

    // B. SEND REAL-TIME ALERT (Socket.io)
    const io = req.app.get("socketio");
    if (io) {
        const payload = {
            title,
            message,
            time: new Date().toLocaleTimeString()
        };

        if (target && target !== "ALL") {
            // 🎯 Send to Specific Room
            io.to(target).emit("receive_notice", { ...payload, target });
            console.log(`📢 Notice sent to room: ${target}`);
        } else {
            // 🌍 Send to Global
            io.emit("receive_notice", { ...payload, target: "ALL" });
            console.log(`📢 Global notice sent`);
        }
    }

    res.json({ message: "📢 Notice Posted & Broadcasted Successfully!" });

  } catch (err) {
    console.error("Broadcast Error:", err);
    res.status(500).json({ error: "Failed to send notice" });
  }
};