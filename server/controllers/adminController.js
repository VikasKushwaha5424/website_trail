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

// 🔑 IMPORT CONSTANTS (Magic Strings Fix)
const { ROLES } = require("../config/roles");

// =========================================================
// 🕒 HELPER: Convert "HH:mm" String to Minutes (Integer)
// This ensures 9:00 AM (540) is mathematically less than 10:00 AM (600)
// =========================================================
const convertToMinutes = (timeStr) => {
  if (typeof timeStr === 'number') return timeStr; // Already a number? Return it.
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(":")) {
    throw new Error(`Invalid time format '${timeStr}'. Expected HH:mm`);
  }
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

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

    // ---------------------------------------------------------
    // 1. DEPARTMENT VALIDATION & RESOLUTION
    // ---------------------------------------------------------

    // A. Immediate Check: Faculty MUST have a department
    // ✅ FIX: Use ROLES constant
    if (role === ROLES.FACULTY && !departmentId) {
        return res.status(400).json({ message: "Department ID is required for Faculty accounts." });
    }

    // B. Resolve & Verify Department (if provided)
    if (departmentId) {
        // Case 1: Input looks like a MongoDB ID -> Verify it exists
        if (departmentId.match(/^[0-9a-fA-F]{24}$/)) {
            const deptExists = await Department.findById(departmentId);
            if (!deptExists) {
                return res.status(400).json({ error: `Department not found with ID: ${departmentId}` });
            }
        } 
        // Case 2: Input is likely a Code (e.g. "CSE") -> Resolve to ID
        else {
            const dept = await Department.findOne({ code: departmentId }); 
            if (!dept) {
                return res.status(400).json({ error: `Invalid Department Code: ${departmentId}` });
            }
            departmentId = dept._id; // Replace string code with actual ObjectId
        }
    }
    // ---------------------------------------------------------

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
      role, 
      rollNumber: rollNumber || undefined,
      isActive: true
    });

    // 5. Create Specific Profile based on Role
    // ⚠️ CRITICAL: If this fails, we catch it and delete the 'user'
    try {
      // ✅ FIX: Use ROLES constants
      if (role === ROLES.STUDENT) {
        
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        await StudentProfile.create({
          userId: user._id,
          departmentId: departmentId || null, // Can be null initially for students
          rollNumber: rollNumber || "TEMP-" + Date.now(), 
          firstName,      
          lastName,       
          batchYear: batchYear || new Date().getFullYear(),
          currentStatus: "ACTIVE"
        });

      } else if (role === ROLES.FACULTY) {
        if (!departmentId) throw new Error("Department ID is required for Faculty");
        
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
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. GET ALL DEPARTMENTS
// =========================================================
exports.getAllDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
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
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 5. CREATE SEMESTER
// =========================================================
exports.createSemester = async (req, res) => {
  try {
    const { name, code, academicYear, startDate, endDate, isActive } = req.body;

    // Validation is now handled by 'validateSemester' middleware in route

    if (isActive === true) {
        await Semester.updateMany({}, { isActive: false });
    }

    const semester = await Semester.create({
        name, code, academicYear, startDate, endDate, isActive
    });

    res.status(201).json({ message: "Semester Created Successfully", semester });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 6. ASSIGN FACULTY TO COURSE
// =========================================================
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId, semesterId } = req.body;
    
    const facultyProfile = await FacultyProfile.findOne({ userId: facultyId });
    if (!facultyProfile) {
        return res.status(404).json({ message: "Faculty Profile not found for this user." });
    }

    let targetSemesterId = semesterId;
    if (!targetSemesterId) {
        const activeSemesters = await Semester.find({ isActive: true });
        if (activeSemesters.length === 0) {
            return res.status(400).json({ error: "No Active Semester found." });
        }
        targetSemesterId = activeSemesters[0]._id;
    }

    await CourseOffering.create({ 
        facultyId: facultyProfile._id, 
        courseId,
        semesterId: targetSemesterId 
    });
    
    res.status(200).json({ message: "Faculty assigned to course successfully" });

  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ message: "Faculty is already assigned to this course." });
    }
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 7. ENROLL STUDENT (Atomic + Anti-Duplicate Fix)
// =========================================================
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseOfferingId } = req.body;

    // 1. Resolve 'User ID' to 'StudentProfile ID'
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
         return res.status(404).json({ message: "Student Profile not found." });
    }
    const targetStudentId = studentProfile._id;

    // -----------------------------------------------------
    // 🚨 FIX: Prevent Multi-Section Enrollment
    // -----------------------------------------------------
    
    // A. Get details of the requested offering
    const targetOffering = await CourseOffering.findById(courseOfferingId);
    if (!targetOffering) {
        return res.status(404).json({ message: "Course Offering not found" });
    }

    // B. Find ALL offerings for this specific Course in this Semester
    const siblingOfferings = await CourseOffering.find({
        courseId: targetOffering.courseId,
        semesterId: targetOffering.semesterId
    }).select("_id");

    const validOfferingIds = siblingOfferings.map(off => off._id);

    // C. Check if student is already enrolled in ANY of these sections
    const existingEnrollment = await Enrollment.findOne({
      studentId: targetStudentId,
      courseOfferingId: { $in: validOfferingIds },
      status: "ENROLLED"
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
          message: "Student is already enrolled in this course (or another section of it)." 
      });
    }

    // 2. ATOMIC CAPACITY CHECK & RESERVATION
    const offering = await CourseOffering.findOneAndUpdate(
      { 
        _id: courseOfferingId, 
        $expr: { $lt: ["$currentEnrollment", "$capacity"] } 
      },
      { $inc: { currentEnrollment: 1 } },
      { new: true }
    );

    if (!offering) {
        return res.status(400).json({ message: "Enrollment Failed: Class is Full" });
    }

    // 3. Create Enrollment Record
    try {
        const enrollment = await Enrollment.create({
          studentId: targetStudentId,
          courseOfferingId,
          status: "ENROLLED"
        });

        res.status(201).json({ message: "Student Enrolled Successfully", enrollment });

    } catch (enrollError) {
        // 🛑 ROLLBACK
        await CourseOffering.findByIdAndUpdate(courseOfferingId, { $inc: { currentEnrollment: -1 } });
        throw enrollError;
    }

  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 8. BROADCAST NOTICE
// =========================================================
exports.broadcastNotice = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    await Announcement.create({
        title,
        content: message,
        targetAudience: target || "ALL",
        date: new Date(),
        createdBy: req.user.id
    });

    const io = req.app.get("socketio");
    if (io) {
        const payload = { title, message, time: new Date().toLocaleTimeString() };
        if (target && target !== "ALL") {
            io.to(target).emit("receive_notice", { ...payload, target });
        } else {
            io.emit("receive_notice", { ...payload, target: "ALL" });
        }
    }
    res.json({ message: "📢 Notice Posted & Broadcasted Successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send notice" });
  }
};

// =========================================================
// 9. GET ALL USERS (With Pagination, Filtering & Search)
// =========================================================
exports.getAllUsers = async (req, res) => {
  try {
    // 1. Extract Query Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role; 
    const search = req.query.search; // 👈 New Search Parameter

    // 2. Build Query Object
    const query = {};

    // Filter by Role (if provided)
    if (role) {
        query.role = role;
    }

    // 🔎 SEARCH LOGIC: Match Name OR Email (Case Insensitive)
    if (search) {
        // Clean the input to prevent Regex Injection (basic safety)
        const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
        
        query.$or = [
            { name: searchRegex },
            { email: searchRegex }
        ];
    }

    // 3. Calculate Pagination
    const startIndex = (page - 1) * limit;
    const total = await User.countDocuments(query); // Count filtered results

    // 4. Fetch Data
    const users = await User.find(query)
      .select("-passwordHash") // Security: Don't send passwords
      .sort({ createdAt: -1 }) // Newest first
      .skip(startIndex)
      .limit(limit);

    // 5. Send Response
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: { 
          current: page, 
          pages: Math.ceil(total / limit) 
      },
      data: users,
    });

  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// =========================================================
// 10. GET ALL COURSES (With Pagination)
// =========================================================
exports.getAllCourses = async (req, res) => {
  try {
    // 1. Pagination Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // 2. Count Total
    const total = await Course.countDocuments();

    // 3. Fetch Data with Pagination
    const courses = await Course.find()
      .populate("departmentId", "name code") 
      .sort({ name: 1 }) // Alphabetical order
      .skip(startIndex)
      .limit(limit);

    // 4. Send Response
    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: courses,
    });
  } catch (err) {
    console.error("Get All Courses Error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// =========================================================
// 11. GET DASHBOARD STATS
// =========================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const [studentCount, facultyCount, activeSemester, totalCourses] = await Promise.all([
      // ✅ FIX: Use ROLES constants
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.FACULTY }),
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
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// =========================================================
// 12. UPDATE USER
// =========================================================
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.body; 
    const { name, email, role, ...profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role; 
    
    await user.save();

    // ✅ FIX: Use ROLES constants
    if (user.role === ROLES.STUDENT) {
        await StudentProfile.findOneAndUpdate({ userId: user._id }, { $set: profileData }, { new: true });
    } else if (user.role === ROLES.FACULTY) {
        await FacultyProfile.findOneAndUpdate({ userId: user._id }, { $set: profileData }, { new: true });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// =========================================================
// 13. DELETE USER (The Cleanup Operations 🧹)
// =========================================================
exports.deleteUser = async (req, res) => {
  try {
    // RESTful Standard ID param
    const userId = req.params.id; 
    
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ FIX: Use ROLES constants
    // 🅰️ IF STUDENT: Cascade Delete Everything
    if (user.role === ROLES.STUDENT) {
        const studentProfile = await StudentProfile.findOne({ userId: userId });
        
        if (studentProfile) {
            const studentId = studentProfile._id; 

            // 1. Fix Course Enrollments
            const enrollments = await Enrollment.find({ studentId });
            
            // Parallel Updates
            await Promise.all(enrollments.map(enrollment => 
                CourseOffering.findByIdAndUpdate(
                    enrollment.courseOfferingId,
                    { $inc: { currentEnrollment: -1 } }
                )
            ));

            // 2. Delete Related Data
            await Promise.all([
                Enrollment.deleteMany({ studentId }),
                StudentProfile.deleteOne({ _id: studentId })
            ]);
        }
    }

    // 🅱️ IF FACULTY: Check for Active Classes first
    else if (user.role === ROLES.FACULTY) {
        const facultyProfile = await FacultyProfile.findOne({ userId: userId });
        
        if (facultyProfile) {
            const activeClasses = await CourseOffering.countDocuments({ facultyId: facultyProfile._id });
            if (activeClasses > 0) {
                return res.status(400).json({ 
                    error: `Cannot delete Faculty. They are currently assigned to ${activeClasses} active classes.` 
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
        { new: true }
    );
    if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course updated", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 15. DELETE COURSE
// =========================================================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const isBeingTaught = await CourseOffering.exists({ courseId });
    if (isBeingTaught) {
        return res.status(400).json({ error: "Cannot delete this subject. It is currently being offered." });
    }
    await Course.findByIdAndDelete(courseId);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 16. CREATE FEE STRUCTURE
// =========================================================
exports.createFeeStructure = async (req, res) => {
  try {
    const { semesterId, type, amount, dueDate, departmentId, batchYear } = req.body;

    const query = { currentStatus: "ACTIVE" };
    if (departmentId) query.departmentId = departmentId;
    if (batchYear) query.batchYear = batchYear;

    const students = await StudentProfile.find(query).select("_id");
    if (students.length === 0) {
      return res.status(404).json({ message: "No active students found for criteria." });
    }

    const feeDocs = students.map(student => ({
      studentId: student._id,
      semesterId,
      type,
      amountDue: amount,
      dueDate,
      status: "PENDING"
    }));

    await Fee.insertMany(feeDocs);
    res.status(201).json({ 
      message: `Fees assigned successfully to ${students.length} students.`,
      count: students.length 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create fee structure" });
  }
};

// =========================================================
// 17. GET PENDING PAYMENTS
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
// 18. VERIFY PAYMENT
// =========================================================
exports.verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { paymentId, action } = req.body;
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new Error("Payment record not found");

    if (payment.status !== "PENDING") throw new Error(`Payment is already ${payment.status}`);

    if (action === "APPROVE") {
      payment.status = "SUCCESS";
      payment.receiptNumber = `RCP-${Date.now()}`;
      await payment.save({ session });

      const fee = await Fee.findById(payment.feeId).session(session);
      if (fee) {
        fee.amountPaid += payment.amount;
        if (fee.amountPaid >= fee.amountDue) fee.status = "PAID";
        else fee.status = "PARTIAL";
        await fee.save({ session });
      }

    } else if (action === "REJECT") {
      payment.status = "FAILED";
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
    res.status(400).json({ error: err.message });
  }
};

// =========================================================
// 19. FEE STATISTICS
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
// 🕵️ HELPER: CLASH DETECTION (Minutes Based)
// =========================================================
const checkClash = async ({ day, startTime, endTime, roomNumber, semesterId, facultyId, excludeId = null }) => {
  // startTime and endTime are now INTEGERS (Minutes)
  const start = parseInt(startTime); 
  const end = parseInt(endTime);

  const query = {
    dayOfWeek: day,
    semesterId: semesterId,
    _id: { $ne: excludeId }
  };

  const existingEntries = await Timetable.find(query).populate("courseOfferingId");

  for (const entry of existingEntries) {
    const eStart = entry.startTime; // Already minutes in DB
    const eEnd = entry.endTime;

    // Check Overlap
    if (start < eEnd && end > eStart) {
      if (entry.roomNumber === roomNumber) {
        throw new Error(`Room ${roomNumber} is booked (${entry.startTime}-${entry.endTime})`);
      }
      if (entry.courseOfferingId.facultyId.toString() === facultyId.toString()) {
        throw new Error(`Faculty is busy during this time.`);
      }
      throw new Error(`Batch clash: Semester already has class at this time.`);
    }
  }
  return false;
};

// =========================================================
// 20. CREATE TIMETABLE ENTRY (Converts Time)
// =========================================================
exports.createTimetableEntry = async (req, res) => {
  try {
    const { courseOfferingId, dayOfWeek, startTime, endTime, roomNumber } = req.body;

    // 1. Convert Strings "HH:mm" to Minutes (Int)
    const startMin = convertToMinutes(startTime);
    const endMin = convertToMinutes(endTime);

    if (startMin >= endMin) throw new Error("Start time must be before End time");

    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ message: "Course Offering not found" });

    // 2. Run Clash Check
    await checkClash({
      day: dayOfWeek,
      startTime: startMin,
      endTime: endMin,
      roomNumber,
      semesterId: offering.semesterId,
      facultyId: offering.facultyId
    });

    // 3. Save as Minutes
    const timetable = await Timetable.create({
      courseOfferingId,
      dayOfWeek,
      startTime: startMin,
      endTime: endMin,
      roomNumber,
      semesterId: offering.semesterId
    });

    res.status(201).json({ message: "Slot scheduled", timetable });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// =========================================================
// 21. GET TIMETABLE (Sorted Numerically)
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
        populate: [ { path: "courseId" }, { path: "facultyId" } ]
      })
      .sort({ dayOfWeek: 1, startTime: 1 }); // Sort works perfectly with Numbers

    res.status(200).json({ count: schedule.length, data: schedule });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// =========================================================
// 22. DELETE TIMETABLE SLOT
// =========================================================
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.findByIdAndDelete(id);
    res.status(200).json({ message: "Slot removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 23. FIND FREE ROOMS (Converts Time)
// =========================================================
exports.findFreeRooms = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    
    // Convert Inputs
    const startMin = convertToMinutes(startTime);
    const endMin = convertToMinutes(endTime);

    const allClassrooms = await Classroom.find({ isActive: true });
    
    // Check overlaps using Minutes
    const busySlots = await Timetable.find({
        dayOfWeek,
        $or: [
            { startTime: { $lt: endMin }, endTime: { $gt: startMin } }
        ]
    }).select("roomNumber");

    const busyRoomNumbers = busySlots.map(slot => slot.roomNumber);
    const freeRooms = allClassrooms.filter(room => !busyRoomNumbers.includes(room.roomNumber));

    res.status(200).json({ totalRooms: allClassrooms.length, busyCount: busyRoomNumbers.length, freeRooms });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// =========================================================
// 24. CLASSROOM MANAGEMENT
// =========================================================
exports.addClassroom = async (req, res) => {
  try {
    const { roomNumber, capacity, type } = req.body; 
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
// 🕵️ HELPER: EXAM CLASH DETECTION (Minutes Based)
// =========================================================
const checkExamClash = async ({ date, startTime, endTime, roomNumber, semesterId, facultyId }) => {
  const start = parseInt(startTime);
  const end = parseInt(endTime);

  const query = { date: new Date(date), semesterId: semesterId };
  const existingExams = await ExamSchedule.find(query).populate("courseOfferingId");

  for (const entry of existingExams) {
    const eStart = entry.startTime;
    const eEnd = entry.endTime;

    if (start < eEnd && end > eStart) {
      if (entry.roomNumber === roomNumber) throw new Error(`Room ${roomNumber} booked for exam.`);
      if (entry.courseOfferingId.facultyId.toString() === facultyId.toString()) throw new Error(`Faculty is proctoring.`);
      throw new Error(`Semester exam clash.`);
    }
  }
  return false; 
};

// =========================================================
// 25. EXAM SCHEDULER ACTIONS (Converts Time)
// =========================================================
exports.addExamSlot = async (req, res) => {
  try {
    const { courseOfferingId, date, startTime, endTime, roomNumber } = req.body;

    const startMin = convertToMinutes(startTime);
    const endMin = convertToMinutes(endTime);

    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ message: "Course Offering not found" });

    await checkExamClash({
      date, startTime: startMin, endTime: endMin, roomNumber,
      semesterId: offering.semesterId, facultyId: offering.facultyId
    });

    const exam = await ExamSchedule.create({
      courseOfferingId, semesterId: offering.semesterId,
      date, startTime: startMin, endTime: endMin, roomNumber
    });

    res.status(201).json({ message: "Exam Scheduled", exam });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getExamSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const query = date ? { date: new Date(date) } : {};

    const exams = await ExamSchedule.find(query)
      .populate({ path: "courseOfferingId", populate: [{ path: "courseId" }, { path: "facultyId" }] })
      .sort({ date: 1, startTime: 1 }); // Numeric Sort

    res.status(200).json(exams);
  } catch (err) { res.status(500).json({ error: err.message }); }
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
// 26. ATTENDANCE OVERSIGHT
// =========================================================
exports.getAdminAttendance = async (req, res) => {
  try {
    const { courseOfferingId, date } = req.query;
    
    const enrollment = await require("../models/Enrollment").find({ courseOfferingId })
      .populate("studentId", "firstName lastName rollNumber");

    if (!enrollment.length) return res.json([]);

    const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);

    const records = await Attendance.find({
      courseOfferingId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

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

exports.updateAttendanceOverride = async (req, res) => {
  try {
    const { studentId, courseOfferingId, date, status } = req.body;

    const record = await Attendance.findOneAndUpdate(
      { studentId, courseOfferingId, date },
      { 
        status, 
        markedBy: req.user.id, 
        isLocked: true 
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Attendance Updated", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 27. BATCH PROMOTION
// =========================================================
exports.promoteBatch = async (req, res) => {
  try {
    const { departmentId, fromSemester } = req.body;
    const sem = parseInt(fromSemester);

    if (!sem || sem < 1 || sem > 8) {
      return res.status(400).json({ error: "Invalid Semester" });
    }

    const query = { currentSemester: sem, currentStatus: "ACTIVE" };
    if (departmentId) {
      query.departmentId = departmentId;
    }

    let result;
    
    // Graduation
    if (sem === 8) {
      result = await StudentProfile.updateMany(query, {
        $set: { currentStatus: "GRADUATED" }
      });
      return res.status(200).json({ 
        message: `🎓 Batch Graduated! ${result.modifiedCount} students marked as Alumni.` 
      });
    } 
    // Standard Promotion
    else {
      result = await StudentProfile.updateMany(query, {
        $inc: { currentSemester: 1 }
      });
      return res.status(200).json({ 
        message: `✅ Batch Promoted to Semester ${sem + 1}! ${result.modifiedCount} students updated.` 
      });
    }

  } catch (err) {
    console.error("Promotion Error:", err);
    res.status(500).json({ error: err.message });
  }
};