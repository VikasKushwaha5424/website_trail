const mongoose = require("mongoose"); // Required for Transactions
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile");
const Course = require("../models/Course");
const Department = require("../models/Department");
const CourseOffering = require("../models/CourseOffering");
const Semester = require("../models/Semester");
const Enrollment = require("../models/Enrollment");
const Announcement = require("../models/Announcement"); 
const sendEmail = require("../utils/emailService");
const { Fee, Payment } = require("../models/Fee");
const Timetable = require("../models/Timetable"); 
const Classroom = require("../models/Classroom");
const ExamSchedule = require("../models/ExamSchedule"); 
const Attendance = require("../models/Attendance");

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
// 3. GET ALL DEPARTMENTS
// =========================================================
exports.getAllDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts); // Returns array directly [ {name, code}, ... ]
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 4. ADD COURSE (Subject)
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
// 5. CREATE SEMESTER (Handles "Single Active" Rule)
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
// 6. ASSIGN FACULTY TO COURSE (Race-Condition Free + FIXED ID)
// =========================================================
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId, semesterId } = req.body;
    
    // 🔍 FIX: Resolve 'User ID' (from frontend) to 'FacultyProfile ID'
    // The CourseOffering model links to FacultyProfile, not User.
    const facultyProfile = await FacultyProfile.findOne({ userId: facultyId });
    if (!facultyProfile) {
        return res.status(404).json({ message: "Faculty Profile not found for this user." });
    }

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
        facultyId: facultyProfile._id, // 👈 FIX: Use Profile ID
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
// 7. ENROLL STUDENT IN A COURSE (Atomic & Safe + FIXED ID)
// =========================================================
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseOfferingId } = req.body;

    // 🔍 FIX: Resolve 'User ID' (from frontend) to 'StudentProfile ID'
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
         return res.status(404).json({ message: "Student Profile not found for this user." });
    }
    const targetStudentId = studentProfile._id;

    // 1. Prevent Duplicate Enrollment
    // Use targetStudentId (Profile ID) not studentId (User ID)
    const existingEnrollment = await Enrollment.findOne({ studentId: targetStudentId, courseOfferingId });
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
          studentId: targetStudentId, // 👈 FIX: Use Profile ID
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
// 8. BROADCAST NOTICE (Targeted + Saved to DB)
// =========================================================
exports.broadcastNotice = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    // A. SAVE TO DATABASE (So it shows up in the Student Dashboard later)
    await Announcement.create({
        title,
        content: message,
        targetAudience: target || "ALL",
        date: new Date(),
        createdBy: req.user.id // 👈 FIX: Added required 'createdBy' field
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

// =========================================================
// 9. GET ALL USERS (Pagination + Filtering)
// =========================================================
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role; // Optional: Filter by 'student' or 'faculty'

    const query = {};
    if (role) {
      query.role = role;
    }

    // 1. Calculate Pagination
    const startIndex = (page - 1) * limit;
    const total = await User.countDocuments(query);

    // 2. Fetch Users (Exclude Password)
    const users = await User.find(query)
      .select("-passwordHash") // Security: Never send passwords
      .sort({ createdAt: -1 }) // Newest first
      .skip(startIndex)
      .limit(limit);

    // 3. Send Response
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: users,
    });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// =========================================================
// 10. GET ALL COURSES (With Department Details)
// =========================================================
exports.getAllCourses = async (req, res) => {
  try {
    // Populate 'departmentId' to show the actual Department Name, not just the ID
    const courses = await Course.find()
      .populate("departmentId", "name code") 
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    console.error("Get All Courses Error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// =========================================================
// 11. GET DASHBOARD STATS (Widgets Data)
// =========================================================
exports.getDashboardStats = async (req, res) => {
  try {
    // Run these queries in parallel for speed
    const [studentCount, facultyCount, activeSemester, totalCourses] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Semester.findOne({ isActive: true }).select("name code startDate endDate"),
      Course.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        totalCourses: totalCourses,
        activeSemester: activeSemester || null,
      },
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// =========================================================
// 12. UPDATE USER (Handles User + Profile split)
// =========================================================
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.body; // or req.params.id
    const { name, email, role, ...profileData } = req.body;

    // 1. Update Core User Data
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role; 
    // Note: Changing role is dangerous (orphaned profiles), usually disabled.
    
    await user.save();

    // 2. Update Specific Profile
    if (user.role === "student") {
        await StudentProfile.findOneAndUpdate(
            { userId: user._id },
            { $set: profileData }, // Updates rollNumber, batchYear, etc.
            { new: true }
        );
    } else if (user.role === "faculty") {
        await FacultyProfile.findOneAndUpdate(
            { userId: user._id },
            { $set: profileData }, // Updates designation, qualification, etc.
            { new: true }
        );
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// =========================================================
// 13. DELETE USER (The Cleanup Operations 🧹)
// =========================================================
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body; // or req.params.id
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🅰️ IF STUDENT: Cascade Delete Everything
    if (user.role === "student") {
        const studentProfile = await StudentProfile.findOne({ userId: userId });
        
        if (studentProfile) {
            const studentId = studentProfile._id; // The Profile ID used in other tables

            // 1. Fix Course Enrollments (Decrement counts!)
            const enrollments = await Enrollment.find({ studentId });
            for (const enrollment of enrollments) {
                await CourseOffering.findByIdAndUpdate(
                    enrollment.courseOfferingId,
                    { $inc: { currentEnrollment: -1 } }
                );
            }

            // 2. Delete Related Data
            await Promise.all([
                Enrollment.deleteMany({ studentId }),
                // Marks.deleteMany({ studentId }), // Ensure Marks model is imported if used
                // Attendance.deleteMany({ studentId }), // Ensure Attendance model is imported if used
                StudentProfile.deleteOne({ _id: studentId })
            ]);
        }
    }

    // 🅱️ IF FACULTY: Check for Active Classes first
    else if (user.role === "faculty") {
        const facultyProfile = await FacultyProfile.findOne({ userId: userId });
        
        if (facultyProfile) {
            // Check if teaching any active course
            const activeClasses = await CourseOffering.countDocuments({ facultyId: facultyProfile._id });
            if (activeClasses > 0) {
                return res.status(400).json({ 
                    error: `Cannot delete Faculty. They are currently assigned to ${activeClasses} active classes. Reassign those classes first.` 
                });
            }
            await FacultyProfile.deleteOne({ _id: facultyProfile._id });
        }
    }

    // 3. Finally, Delete the Login Account
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and all related data deleted successfully." });

  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// =========================================================
// 14. UPDATE COURSE
// =========================================================
exports.updateCourse = async (req, res) => {
  try {
    const { courseId, name, code, credits, departmentId } = req.body;
    
    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { name, code, credits, departmentId },
        { new: true } // Return the updated doc
    );

    if (!updatedCourse) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "Course updated", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 15. DELETE COURSE (Safe Delete)
// =========================================================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body; // or params

    // Safety: Don't delete a course if it's currently being taught
    const isBeingTaught = await CourseOffering.exists({ courseId });
    if (isBeingTaught) {
        return res.status(400).json({ error: "Cannot delete this subject. It is currently being offered in an active semester." });
    }

    await Course.findByIdAndDelete(courseId);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 16. CREATE FEE STRUCTURE (Bulk Assign Fees)
// =========================================================
exports.createFeeStructure = async (req, res) => {
  try {
    const { 
      semesterId, 
      type, // e.g. "TUITION"
      amount, 
      dueDate, 
      departmentId, // Optional: Filter by Dept
      batchYear     // Optional: Filter by Batch
    } = req.body;

    // 1. Find Target Students
    const query = { currentStatus: "ACTIVE" };
    if (departmentId) query.departmentId = departmentId;
    if (batchYear) query.batchYear = batchYear;

    const students = await StudentProfile.find(query).select("_id");

    if (students.length === 0) {
      return res.status(404).json({ message: "No active students found for criteria." });
    }

    // 2. Prepare Bulk Operations
    const feeDocs = students.map(student => ({
      studentId: student._id,
      semesterId,
      type,
      amountDue: amount,
      dueDate,
      status: "PENDING"
    }));

    // 3. Insert Many (Fast)
    await Fee.insertMany(feeDocs);

    res.status(201).json({ 
      message: `Fees assigned successfully to ${students.length} students.`,
      count: students.length 
    });

  } catch (err) {
    console.error("Assign Fee Error:", err);
    res.status(500).json({ error: "Failed to create fee structure" });
  }
};

// =========================================================
// 17. GET PENDING PAYMENTS (For Verification)
// =========================================================
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "PENDING" })
      .populate("studentId", "firstName lastName rollNumber")
      .populate("feeId", "type amountDue")
      .sort({ createdAt: 1 });

    res.status(200).json({ count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 18. VERIFY PAYMENT (Approve/Reject)
// =========================================================
exports.verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId, action } = req.body; // action: "APPROVE" or "REJECT"

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new Error("Payment record not found");

    if (payment.status !== "PENDING") {
      throw new Error(`Payment is already ${payment.status}`);
    }

    if (action === "APPROVE") {
      // 1. Mark Payment as Success
      payment.status = "SUCCESS";
      payment.receiptNumber = `RCP-${Date.now()}`; // Generate Receipt now
      await payment.save({ session });

      // 2. Update the Fee Record
      const fee = await Fee.findById(payment.feeId).session(session);
      if (fee) {
        fee.amountPaid += payment.amount;
        // Update Status
        if (fee.amountPaid >= fee.amountDue) fee.status = "PAID";
        else fee.status = "PARTIAL";
        
        await fee.save({ session });
      }

    } else if (action === "REJECT") {
      payment.status = "FAILED";
      // Optional: Add a rejectionReason field to model if needed
      await payment.save({ session });
    } else {
      throw new Error("Invalid Action");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: `Payment ${action}D Successfully` });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Verify Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// =========================================================
// 19. FEE STATISTICS (Extra Feature)
// =========================================================
exports.getFeeStats = async (req, res) => {
  try {
    const stats = await Fee.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amountDue" },
          collectedAmount: { $sum: "$amountPaid" },
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 🕵️ HELPER: CLASH DETECTION LOGIC
// Returns 'true' if a clash exists (used by Create/Update Timetable)
// =========================================================
const checkClash = async ({ day, startTime, endTime, roomNumber, semesterId, facultyId, excludeId = null }) => {
  
  // 1. Convert "09:00" to minutes (e.g. 540) for easy comparison
  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const start = getMinutes(startTime);
  const end = getMinutes(endTime);

  // 2. Find POTENTIAL overlaps (Same Day + Same Semester)
  // We check 3 types of clashes:
  // A. Room is occupied
  // B. Faculty is busy (need to lookup CourseOffering to get faculty)
  
  const query = {
    dayOfWeek: day,
    semesterId: semesterId,
    _id: { $ne: excludeId } // Exclude self for updates
  };

  const existingEntries = await Timetable.find(query).populate("courseOfferingId");

  for (const entry of existingEntries) {
    const eStart = getMinutes(entry.startTime);
    const eEnd = getMinutes(entry.endTime);

    // Check Time Overlap: (StartA < EndB) and (EndA > StartB)
    if (start < eEnd && end > eStart) {
      
      // TYPE 1: ROOM CLASH
      if (entry.roomNumber === roomNumber) {
        throw new Error(`Room ${roomNumber} is already booked from ${entry.startTime} to ${entry.endTime}`);
      }

      // TYPE 2: FACULTY CLASH (Prof can't be in two places)
      // We assume facultyId is passed in to check against
      if (entry.courseOfferingId.facultyId.toString() === facultyId.toString()) {
        throw new Error(`Faculty is already teaching ${entry.courseOfferingId.section} during this time.`);
      }

      // TYPE 3: STUDENT BATCH CLASH (Same Semester cannot have 2 classes)
      // Since we filtered by semesterId in the query, any time overlap is a clash for students!
      throw new Error(`This Semester already has a class scheduled at this time (${entry.startTime} - ${entry.endTime})`);
    }
  }
  return false; // No clash
};

// =========================================================
// 20. CREATE TIMETABLE ENTRY (Master Schedule)
// =========================================================
exports.createTimetableEntry = async (req, res) => {
  try {
    const { courseOfferingId, dayOfWeek, startTime, endTime, roomNumber } = req.body;

    // 1. Get Details for Clash Check
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ message: "Course Offering not found" });

    // 2. Run Clash Detection
    await checkClash({
      day: dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      semesterId: offering.semesterId,
      facultyId: offering.facultyId
    });

    // 3. Save if safe
    const timetable = await Timetable.create({
      courseOfferingId,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      semesterId: offering.semesterId
    });

    res.status(201).json({ message: "Slot scheduled successfully", timetable });

  } catch (err) {
    console.error("Timetable Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// =========================================================
// 21. GET TIMETABLE (Filtered View)
// =========================================================
exports.getTimetable = async (req, res) => {
  try {
    const { semesterId, day } = req.query;
    
    const query = {};
    if (semesterId) query.semesterId = semesterId;
    if (day) query.dayOfWeek = day;

    const schedule = await Timetable.find(query)
      .populate({
        path: "courseOfferingId",
        populate: [
           { path: "courseId", select: "name code" },
           { path: "facultyId", select: "firstName lastName" }
        ]
      })
      .sort({ dayOfWeek: 1, startTime: 1 }); // Sorted Mon->Sat, 9am->5pm

    res.status(200).json({ count: schedule.length, data: schedule });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 22. DELETE TIMETABLE SLOT
// =========================================================
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params; // Passed in URL /api/admin/timetable/:id
    await Timetable.findByIdAndDelete(id);
    res.status(200).json({ message: "Slot removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 23. FIND FREE ROOMS (The "Free Slot Finder")
// =========================================================
exports.findFreeRooms = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    // Input example: { "dayOfWeek": "MONDAY", "startTime": 900, "endTime": 1030 }

    // 1. Get ALL Classrooms
    const allClassrooms = await Classroom.find({ isActive: true });
    
    // 2. Find BUSY Rooms (In the Master Timetable)
    const busySlots = await Timetable.find({
        dayOfWeek,
        $or: [
            // Check Overlap: (StartA < EndB) and (EndA > StartB)
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    }).select("roomNumber");

    const busyRoomNumbers = busySlots.map(slot => slot.roomNumber);

    // 3. Subtract Busy from All
    const freeRooms = allClassrooms.filter(room => !busyRoomNumbers.includes(room.roomNumber));

    res.status(200).json({ 
        totalRooms: allClassrooms.length,
        busyCount: busyRoomNumbers.length,
        freeRooms 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 24. CLASSROOM MANAGEMENT (The Missing Piece!)
// =========================================================
exports.addClassroom = async (req, res) => {
  try {
    const { roomNumber, capacity, type } = req.body; 
    // Type could be "LECTURE_HALL", "LAB", "SEMINAR_HALL"
    const room = await Classroom.create({ roomNumber, capacity, type, isActive: true });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllClassrooms = async (req, res) => {
  try {
    const rooms = await Classroom.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteClassroom = async (req, res) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 🕵️ HELPER: EXAM CLASH DETECTION (Specific Date)
// =========================================================
const checkExamClash = async ({ date, startTime, endTime, roomNumber, semesterId, facultyId }) => {
  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const start = getMinutes(startTime);
  const end = getMinutes(endTime);

  // Check specific DATE in ExamSchedule collection
  // Note: We compare dates using ISO strings to ignore time components if needed, 
  // but usually strict Date matching is fine if frontend sends YYYY-MM-DD 00:00:00.
  // Here we assume 'date' is passed correctly as a Date object or ISO string.
  
  const query = {
    date: new Date(date), // Ensure it matches the stored format
    semesterId: semesterId
  };

  const existingExams = await ExamSchedule.find(query).populate("courseOfferingId");

  for (const entry of existingExams) {
    const eStart = getMinutes(entry.startTime);
    const eEnd = getMinutes(entry.endTime);

    // Overlap Check
    if (start < eEnd && end > eStart) {
      if (entry.roomNumber === roomNumber) {
        throw new Error(`Room ${roomNumber} is already booked for an exam on this date.`);
      }
      if (entry.courseOfferingId.facultyId.toString() === facultyId.toString()) {
        throw new Error(`Faculty is already proctoring an exam at this time.`);
      }
      throw new Error(`This Semester already has an exam scheduled at this time.`);
    }
  }
  return false; 
};

// =========================================================
// 25. EXAM SCHEDULER ACTIONS
// =========================================================

exports.addExamSlot = async (req, res) => {
  try {
    const { courseOfferingId, date, startTime, endTime, roomNumber } = req.body;

    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ message: "Course Offering not found" });

    // Run Exam Clash Check
    await checkExamClash({
      date,
      startTime,
      endTime,
      roomNumber,
      semesterId: offering.semesterId,
      facultyId: offering.facultyId
    });

    const exam = await ExamSchedule.create({
      courseOfferingId,
      semesterId: offering.semesterId,
      date,
      startTime,
      endTime,
      roomNumber
    });

    res.status(201).json({ message: "Exam Scheduled", exam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getExamSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    // Filter by specific date if provided
    const query = date ? { date: new Date(date) } : {};

    const exams = await ExamSchedule.find(query)
      .populate({
         path: "courseOfferingId",
         populate: [
            { path: "courseId", select: "name code" },
            { path: "facultyId", select: "firstName lastName" }
         ]
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteExamSlot = async (req, res) => {
  try {
    await ExamSchedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Exam slot deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 26. ATTENDANCE OVERSIGHT (Admin View & Fix)
// =========================================================

// A. View Attendance for a specific Class & Date
exports.getAdminAttendance = async (req, res) => {
  try {
    const { courseOfferingId, date } = req.query;
    
    // 1. Get the list of students enrolled in this course
    // (We need this to show "Absent" students who have NO record)
    const enrollment = await require("../models/Enrollment").find({ courseOfferingId })
      .populate("studentId", "firstName lastName rollNumber");

    if (!enrollment.length) return res.json([]);

    // 2. Get existing attendance records for this date
    // Note: Date passing from frontend should be handled carefully (YYYY-MM-DD)
    const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);

    const records = await Attendance.find({
      courseOfferingId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 3. Merge Data (Combine Enrolled List with Attendance Status)
    const mergedData = enrollment.map(enrol => {
      const record = records.find(r => r.studentId.toString() === enrol.studentId._id.toString());
      return {
        student: enrol.studentId,
        status: record ? record.status : "NOT_MARKED",
        recordId: record ? record._id : null,
        isLocked: record ? record.isLocked : false
      };
    });

    res.json(mergedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// B. Override/Fix Attendance (Admin Power)
exports.updateAttendanceOverride = async (req, res) => {
  try {
    const { studentId, courseOfferingId, date, status } = req.body;

    // Admin can update/upsert even if it was "Locked" by faculty
    const record = await Attendance.findOneAndUpdate(
      { studentId, courseOfferingId, date },
      { 
        status, 
        markedBy: req.user.id, // Track that Admin changed it
        isLocked: true // Keep it locked
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Attendance Updated", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};