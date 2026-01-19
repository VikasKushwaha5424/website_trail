const Marks = require("../models/Marks");
const CourseOffering = require("../models/CourseOffering");
const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");
const { calculateSGPA } = require("../utils/gpaService");

// =========================================================
// 1. FACULTY: GET ENROLLED STUDENTS FOR A CLASS
// =========================================================
exports.getClassList = async (req, res) => {
  try {
    const { courseOfferingId } = req.query;
    
    // Get all enrollments for this class
    const enrollments = await Enrollment.find({ courseOfferingId })
      .populate("studentId", "firstName lastName rollNumber");

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. FACULTY: ENTER / UPDATE MARKS (FIXED VALIDATION)
// =========================================================
exports.updateMarks = async (req, res) => {
  try {
    const { studentId, courseOfferingId, examType, marksObtained, maxMarks } = req.body;

    // 👇 VALIDATION: Check if Marks Obtained > Max Marks
    if (Number(marksObtained) > Number(maxMarks)) {
        return res.status(400).json({ 
            error: `Marks Obtained (${marksObtained}) cannot be greater than Max Marks (${maxMarks})` 
        });
    }

    // 1. Check if Locked (Published)
    const existingMark = await Marks.findOne({ studentId, courseOfferingId, examType });
    if (existingMark && existingMark.isLocked) {
      return res.status(400).json({ error: "Marks are frozen/published. Cannot edit." });
    }

    // 2. Upsert (Update if exists, Insert if new)
    const marks = await Marks.findOneAndUpdate(
      { studentId, courseOfferingId, examType },
      { marksObtained, maxMarks, isLocked: false },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Marks Saved", marks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. FACULTY: GET EXISTING MARKS (For Pre-filling)
// =========================================================
exports.getCourseMarks = async (req, res) => {
  try {
    const { courseOfferingId, examType } = req.query;
    const marks = await Marks.find({ courseOfferingId, examType });
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 4. ADMIN: PUBLISH RESULTS (LOCK MARKS)
// =========================================================
exports.publishResults = async (req, res) => {
  try {
    const { semesterId } = req.body;

    // 1. Find all courses in this semester
    const offerings = await CourseOffering.find({ semesterId }).select("_id");
    const offeringIds = offerings.map(o => o._id);

    // 2. Lock all marks for these courses
    await Marks.updateMany(
      { courseOfferingId: { $in: offeringIds } },
      { $set: { isLocked: true } }
    );

    res.json({ message: "Results Published Successfully! Marks are now visible to students." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 5. STUDENT: VIEW RESULTS & GPA
// =========================================================
exports.getStudentResults = async (req, res) => {
  try {
    const { semesterId } = req.query;
    // We need the Profile ID, not the User ID from the token
    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    if (!studentProfile) return res.status(404).json({ error: "Student Profile not found" });

    // 1. Find Courses in Semester
    const offerings = await CourseOffering.find({ semesterId }).select("_id");
    const offeringIds = offerings.map(o => o._id);

    // 2. Fetch LOCKED (Published) Marks Only
    const marks = await Marks.find({ 
      studentId: studentProfile._id, 
      courseOfferingId: { $in: offeringIds },
      isLocked: true // Only show if Admin published
    }).populate({
        path: "courseOfferingId",
        populate: { path: "courseId", select: "name code credits" }
    });

    // 3. Calculate SGPA (using your util)
    const sgpa = await calculateSGPA(studentProfile._id, semesterId);

    res.json({ marks, sgpa });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};