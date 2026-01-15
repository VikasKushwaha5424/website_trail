const CourseOffering = require("../models/CourseOffering");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile"); 
const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");
const Marks = require("../models/Marks");
const Announcement = require("../models/Announcement");

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
    const { offeringId } = req.params;
    const userId = req.user.id; // Logged in User ID

    // 1. Get Faculty Profile
    const facultyProfile = await FacultyProfile.findOne({ userId });
    if (!facultyProfile) {
        return res.status(403).json({ message: "Access denied. Faculty profile not found." });
    }
    
    // 2. 🛡️ SECURITY CHECK: Verify this faculty OWNS this course offering
    // (This prevents Faculty A from peeking at Faculty B's student list)
    const offering = await CourseOffering.findOne({ 
        _id: offeringId, 
        facultyId: facultyProfile._id 
    });

    if (!offering) {
        return res.status(403).json({ message: "Access Denied: You are not teaching this course." });
    }

    // 3. Fetch Students if authorized
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
        email: e.studentId.userId.email, // 👈 ADDED: Required for "Contact Class" feature
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

    // 1. Get the Faculty Profile
    const facultyProfile = await FacultyProfile.findOne({ userId });
    if (!facultyProfile) {
        return res.status(403).json({ message: "Access denied. Faculty profile not found." });
    }

    // 2. SECURITY CHECK: Verify ownership
    const offering = await CourseOffering.findOne({ 
        _id: offeringId, 
        facultyId: facultyProfile._id 
    });

    if (!offering) {
        return res.status(403).json({ message: "Security Warning: You are not authorized to mark attendance for this course." });
    }

    // 3. Force date to midnight UTC (Fixes Timezone duplication bugs)
    // This ensures "9:00 AM" and "10:00 AM" are treated as the same "Day"
    const cleanDate = new Date(date);
    cleanDate.setUTCHours(0, 0, 0, 0); 
    
    // 4. Save Attendance
    await Promise.all(students.map(async (record) => {
      return Attendance.findOneAndUpdate(
        { 
          studentId: record.studentId, 
          courseOfferingId: offeringId, 
          date: cleanDate 
        }, 
        { 
          status: record.status,
          markedBy: userId // Audit: Track who marked it
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

    // 2. SECURITY CHECK: Verify Faculty Ownership
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

// =========================================================
// 5. POST CLASS ANNOUNCEMENT (NEW)
// =========================================================
exports.postClassAnnouncement = async (req, res) => {
  try {
    const { courseOfferingId, title, message, isImportant } = req.body;
    const userId = req.user.id; 

    // Optional: Security Check to ensure faculty owns this course
    const facultyProfile = await FacultyProfile.findOne({ userId });
    const isOwner = await CourseOffering.exists({ 
        _id: courseOfferingId, 
        facultyId: facultyProfile._id 
    });
    
    if (!isOwner) {
        return res.status(403).json({ error: "You are not authorized to post notices for this course." });
    }

    // Create the notice linked to the Course and the User
    const notice = await Announcement.create({
      title,
      message,
      targetAudience: "STUDENT", // Matches your Enum
      courseOfferingId,          // The Critical Link
      createdBy: userId,         // Matches your Schema
      isImportant: isImportant || false
    });

    res.status(201).json(notice);
  } catch (err) {
    console.error("Announcement Error:", err);
    res.status(500).json({ error: err.message });
  }
};