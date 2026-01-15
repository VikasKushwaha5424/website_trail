const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");
const CourseOffering = require("../models/CourseOffering");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");
const Semester = require("../models/Semester"); 
const Announcement = require("../models/Announcement");

// =========================================================
// 1. GET STUDENT PROFILE
// =========================================================
exports.getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
      .populate("departmentId", "name code")
      .populate("userId", "email name rollNumber"); 

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 2. GET TIMETABLE (Active Semester Only)
// =========================================================
exports.getStudentCourses = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find the Active Semester
    const activeSemester = await Semester.findOne({ isActive: true });
    if (!activeSemester) {
        return res.json([]); // No active semester = Empty Timetable
    }

    // Filter enrollments by Active Semester
    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate({
        path: "courseOfferingId",
        match: { semesterId: activeSemester._id }, // 👈 ONLY fetch current semester offerings
        populate: [
          { path: "courseId", select: "name code credits" }, 
          { path: "facultyId", populate: { path: "userId", select: "name" } } 
        ]
      });

    // Format Data
    const timetable = enrollments
      .filter(enroll => enroll.courseOfferingId) // Remove nulls (past semesters)
      .map(enroll => {
        const offering = enroll.courseOfferingId;
        const facultyName = offering.facultyId && offering.facultyId.userId 
          ? offering.facultyId.userId.name 
          : "TBD";

        return {
          courseName: offering.courseId.name,
          courseCode: offering.courseId.code,
          credits: offering.courseId.credits,
          faculty: facultyName,
          room: offering.roomNumber,
          section: offering.section,
          status: enroll.status
        };
      });

    res.json(timetable);
  } catch (error) {
    console.error("Courses Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 3. GET ATTENDANCE SUMMARY (Active Semester Only)
// =========================================================
exports.getAttendanceStats = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const activeSemester = await Semester.findOne({ isActive: true });
    
    // ✅ FIX: Handle Case with No Active Semester
    if (!activeSemester) {
        return res.json({
            message: "No active semester currently.",
            totalClasses: 0,
            presentClasses: 0,
            absentClasses: 0,
            attendancePercentage: "0.00"
        });
    }

    // Proceed only if there IS an active semester
    let query = { studentId: student._id };
    
    // Only count attendance for the current semester's offerings
    const currentOfferings = await CourseOffering.find({ semesterId: activeSemester._id }).select("_id");
    const offeringIds = currentOfferings.map(o => o._id);
    query.courseOfferingId = { $in: offeringIds };

    const totalClasses = await Attendance.countDocuments(query);
    const presentClasses = await Attendance.countDocuments({ 
      ...query, 
      status: { $in: ["PRESENT", "LATE"] } 
    });

    const percentage = totalClasses === 0 ? 0 : (presentClasses / totalClasses) * 100;

    res.json({
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      attendancePercentage: percentage.toFixed(2)
    });
  } catch (error) {
    console.error("Attendance Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 4. GET MY MARKS (Safe Division Fix)
// =========================================================
exports.getStudentMarks = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const marks = await Marks.find({ studentId: student._id })
      .populate({
        path: "courseOfferingId",
        populate: { path: "courseId", select: "name code" }
      });

    const result = marks.map(m => {
        if(!m.courseOfferingId || !m.courseOfferingId.courseId) return null;

        // ✅ FIX: Prevent Division by Zero
        const percentage = m.maxMarks > 0 
            ? ((m.marksObtained / m.maxMarks) * 100).toFixed(1) 
            : "N/A"; 

        return {
          exam: m.examType, 
          subject: m.courseOfferingId.courseId.name,
          obtained: m.marksObtained,
          max: m.maxMarks,
          percentage: percentage
        }
    }).filter(item => item !== null);

    res.json(result);
  } catch (error) {
    console.error("Marks Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 5. GET DASHBOARD ANNOUNCEMENTS (Global + Class Specific)
// =========================================================
exports.getDashboardAnnouncements = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // 1. Find the student's Enrolled Courses (Active)
    const enrollments = await Enrollment.find({ 
        studentId: student._id, 
        status: "ENROLLED" 
    });
    const myCourseIds = enrollments.map(e => e.courseOfferingId);

    // 2. Fetch Logic: 
    // Get (Global Notices) OR (My Specific Class Notices)
    // AND Ensure they are not expired
    const notices = await Announcement.find({
      $and: [
        {
          $or: [
            // Global: Audience is ALL or STUDENT, but NOT linked to a specific course
            { 
              targetAudience: { $in: ["ALL", "STUDENT"] }, 
              courseOfferingId: null 
            },
            // Class Specific: Linked to one of my courses
            { 
              courseOfferingId: { $in: myCourseIds } 
            }
          ]
        },
        // Expiry Logic: Exists (false), Null, or Future
        {
          $or: [
            { expiresAt: { $exists: false } }, 
            { expiresAt: null },               
            { expiresAt: { $gt: new Date() } } 
          ]
        }
      ]
    })
    .populate({
      path: "courseOfferingId",
      populate: { path: "courseId", select: "name code" } // Show "CS101"
    })
    .populate("createdBy", "name") // Show "Prof. X"
    .sort({ createdAt: -1 }) // Newest first
    .limit(20);

    res.json(notices);
  } catch (err) {
    console.error("Announcement Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 6. GET ID CARD DETAILS (For PDF Generator)
// =========================================================
exports.getIDCardDetails = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id })
      .populate("departmentId", "name code")
      .populate("userId", "email"); 

    if (!student) return res.status(404).json({ error: "Student not found" });

    // Calculate Validity (e.g., 4 years from admission or current date)
    const issueDate = new Date();
    const validUpto = new Date(issueDate);
    validUpto.setFullYear(validUpto.getFullYear() + 4); 

    const idData = {
      name: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      department: student.departmentId?.name || "N/A",
      dob: student.dateOfBirth,
      bloodGroup: student.bloodGroup || "N/A", 
      contact: student.contactNumber,
      address: student.currentAddress || "Campus Hostel",
      photo: student.profilePicture || "https://via.placeholder.com/150",
      validUpto: validUpto.toISOString(),
      universityName: "Mythic University of Technology",
      authoritySignature: "REGISTRAR" 
    };

    res.json(idData);
  } catch (err) {
    console.error("ID Card Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};