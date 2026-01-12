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
      .populate("courseId", "name code credits"); 
    
    // Return the Offering ID (assignmentId) AND Course Details
    const courses = assignments
      .filter(a => a.courseId) 
      .map(a => ({
        offeringId: a._id, 
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
    // Note: Ensure your route is defined as /course/:offeringId/students
    const { offeringId } = req.params;
    
    const offering = await CourseOffering.findById(offeringId);
    if (!offering) return res.status(404).json({ message: "Course offering not found" });

    const enrollments = await Enrollment.find({ courseOfferingId: offeringId })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name rollNumber email" } 
      });

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
// 3. Mark Attendance (SECURED + NORMALIZED DATE)
// =========================================================
exports.markAttendance = async (req, res) => {
  try {
    const { offeringId, date, students } = req.body; 
    const userId = req.user.id;

    // 🔒 1. Get the Faculty Profile of the logged-in user
    const facultyProfile = await FacultyProfile.findOne({ userId });
    if (!facultyProfile) {
        return res.status(403).json({ message: "Access denied. Faculty profile not found." });
    }

    // 🔒 2. SECURITY CHECK: Verify this faculty owns this course offering
    const offering = await CourseOffering.findOne({ 
        _id: offeringId, 
        facultyId: facultyProfile._id 
    });

    if (!offering) {
        return res.status(403).json({ message: "Security Warning: You are not authorized to mark attendance for this course." });
    }

    // 🛠️ FIX 1: Force date to midnight UTC to ensure uniqueness works
    // This prevents "9:00 AM" and "10:00 AM" from counting as different days
    const cleanDate = new Date(date);
    cleanDate.setUTCHours(0, 0, 0, 0); 
    
    // 3. Proceed to Save Attendance
    await Promise.all(students.map(async (record) => {
      return Attendance.findOneAndUpdate(
        { 
          studentId: record.studentId, 
          courseOfferingId: offeringId, 
          date: cleanDate // 👈 Use clean date
        }, 
        { 
          status: record.status,
          markedBy: userId // 👈 FIX 2: Audit Logic (Track who marked it)
        }, 
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
// 4. UPLOAD/UPDATE MARKS (SECURED)
// =========================================================
exports.updateMarks = async (req, res) => {
  try {
    const { studentId, courseOfferingId, examType, marks, maxMarks } = req.body;
    const userId = req.user.id;

    // 1. Input Validation
    if (marks > maxMarks) {
        return res.status(400).json({ error: "Marks obtained cannot exceed Max Marks" });
    }

    // 🔒 2. SECURITY CHECK: Verify Faculty Ownership
    const facultyProfile = await FacultyProfile.findOne({ userId });
    if (!facultyProfile) {
        return res.status(403).json({ message: "Access denied. Faculty profile not found." });
    }

    const offering = await CourseOffering.findOne({ 
        _id: courseOfferingId, 
        facultyId: facultyProfile._id 
    });

    if (!offering) {
        return res.status(403).json({ message: "You are not authorized to grade this course." });
    }

    // 3. Find and Update (or Create if not exists)
    const record = await Marks.findOneAndUpdate(
      { studentId, courseOfferingId, examType },
      { 
        marksObtained: marks, 
        maxMarks: maxMarks,
        isLocked: false 
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Marks updated successfully", record });
  } catch (err) {
    console.error("Marks Error:", err);
    res.status(500).json({ error: "Failed to update marks" });
  }
};