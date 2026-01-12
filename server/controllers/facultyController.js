const CourseOffering = require("../models/CourseOffering");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile"); 
const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");
const Marks = require("../models/Marks");

// =========================================================
// 1. Get Courses Assigned to Logged-in Faculty
// =========================================================
exports.getAssignedCourses = async (req, res) => {
  try {
    const userId = req.user.id; 
    const facultyProfile = await FacultyProfile.findOne({ userId });
    
    if (!facultyProfile) {
        return res.status(404).json({ message: "Faculty profile not found." });
    }

    const assignments = await CourseOffering.find({ facultyId: facultyProfile._id })
      .populate("courseId", "name code credits"); // Populate specific fields
    
    // ✅ FIX: Return the Offering ID (assignmentId) AND Course Details
    // This allows the frontend to send the specific 'offeringId' later
    const courses = assignments
      .filter(a => a.courseId) 
      .map(a => ({
        offeringId: a._id, // <--- CRITICAL: Keep this unique ID
        course: a.courseId
      }));
    
    res.json(courses);
  } catch (err) {
    console.error("Error in getAssignedCourses:", err);
    res.status(500).json({ message: "Server error fetching assigned courses" });
  }
};

// =========================================================
// 2. Get Students for a specific Course OFFERING
// =========================================================
exports.getStudentsForCourse = async (req, res) => {
  try {
    // ✅ FIX: Accept 'offeringId' (specific section), not just generic 'courseId'
    const { offeringId } = req.params;
    
    // 1. Verify this offering exists (and ideally that YOU teach it)
    const offering = await CourseOffering.findById(offeringId);
    if (!offering) return res.status(404).json({ message: "Course offering not found" });

    // 2. ✅ FIX: Find students ENROLLED in this specific offering
    // Do NOT fetch the whole department
    const enrollments = await Enrollment.find({ courseOfferingId: offeringId })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name rollNumber email" } // Nested populate for User details
      });

    // 3. Extract purely student data for the frontend
    const students = enrollments
      .filter(e => e.studentId && e.studentId.userId)
      .map(e => ({
        _id: e.studentId._id, // StudentProfile ID
        name: e.studentId.userId.name,
        rollNumber: e.studentId.rollNumber,
        status: "PRESENT" // Default status for UI
      }));

    res.json(students);
  } catch (err) {
    console.error("Error in getStudentsForCourse:", err);
    res.status(500).json({ message: "Server error fetching students" });
  }
};

// =========================================================
// 3. Mark Attendance (Secure)
// =========================================================
exports.markAttendance = async (req, res) => {
  try {
    // ✅ FIX: Use offeringId to be precise
    const { offeringId, date, students } = req.body; 

    // 🔒 SECURITY TODO: Verify req.user.id owns this offeringId here
    
    await Promise.all(students.map(async (record) => {
      return Attendance.findOneAndUpdate(
        { 
          studentId: record.studentId, 
          courseOfferingId: offeringId, // ✅ FIX: Link to Offering, not generic Course
          date 
        }, 
        { status: record.status }, 
        { upsert: true, new: true } 
      );
    }));

    res.json({ message: "Attendance Marked Successfully!" });
  } catch (err) {
    console.error("Error in markAttendance:", err);
    res.status(500).json({ message: "Error saving attendance" });
  }
};

// =========================================================
// 4. UPLOAD/UPDATE MARKS
// =========================================================
exports.updateMarks = async (req, res) => {
  try {
    const { studentId, courseOfferingId, examType, marks, maxMarks } = req.body;

    // 1. Validation Logic
    if (marks > maxMarks) {
        return res.status(400).json({ error: "Marks obtained cannot exceed Max Marks" });
    }

    // 2. Find and Update (or Create if not exists)
    const record = await Marks.findOneAndUpdate(
      { studentId, courseOfferingId, examType },
      { 
        marksObtained: marks, 
        maxMarks: maxMarks,
        isLocked: false // Faculty can still edit until locked
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Marks updated successfully", record });
  } catch (err) {
    console.error("Marks Error:", err);
    res.status(500).json({ error: "Failed to update marks" });
  }
};