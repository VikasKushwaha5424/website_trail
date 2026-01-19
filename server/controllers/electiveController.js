const CourseOffering = require("../models/CourseOffering");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile");
const Semester = require("../models/Semester"); 

// =========================================================
// 1. GET AVAILABLE ELECTIVES
// =========================================================
exports.getElectives = async (req, res) => {
  try {
    let { semesterId } = req.query; 

    // 1️⃣ AUTO-DETECT SEMESTER if missing or undefined
    if (!semesterId || semesterId === "undefined") {
        const activeSemester = await Semester.findOne({ isActive: true });
        
        // If no active semester exists, return empty lists immediately
        if (!activeSemester) {
            return res.json({ electives: [], myCourseIds: [] });
        }
        semesterId = activeSemester._id;
    }
    
    // Find courses marked as Elective for this semester
    const electives = await CourseOffering.find({ 
      semesterId, 
      isElective: true
      // You can add isOpen: true here if you want to hide closed courses completely
    }).populate("courseId", "name code credits description")
      .populate("facultyId", "firstName lastName");

    // Also fetch what the student has ALREADY picked (to disable buttons)
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    const myEnrollments = await Enrollment.find({ 
      studentId: student._id 
    }).select("courseOfferingId");

    const myCourseIds = myEnrollments.map(e => e.courseOfferingId.toString());

    res.json({ electives, myCourseIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. ENROLL (Atomic: Prevents Race Conditions)
// =========================================================
exports.enrollElective = async (req, res) => {
  try {
    const { offeringId } = req.body;
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    // A. Check if already enrolled in THIS course
    const existing = await Enrollment.findOne({ studentId: student._id, courseOfferingId: offeringId });
    if (existing) return res.status(400).json({ error: "Already enrolled." });

    // B. ATOMIC UPDATE (The Gatekeeper 🛡️)
    // We try to increment count ONLY IF count is currently less than capacity.
    // Uses 'currentEnrollment' and 'capacity' to match your Admin Controller logic.
    const course = await CourseOffering.findOneAndUpdate(
      { 
        _id: offeringId, 
        $expr: { $lt: ["$currentEnrollment", "$capacity"] } // 👈 Validates seat limit in DB layer
      },
      { $inc: { currentEnrollment: 1 } }, // Atomic Increment
      { new: true }
    );

    if (!course) {
      return res.status(400).json({ error: "Enrollment Failed: Class is Full." });
    }

    // C. Create Enrollment Record
    await Enrollment.create({
      studentId: student._id,
      courseOfferingId: offeringId,
      enrollmentDate: new Date(),
      status: "ENROLLED"
    });

    res.json({ message: "Success! Seat reserved.", course });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. DROP ELECTIVE
// =========================================================
exports.dropElective = async (req, res) => {
  try {
    const { offeringId } = req.body;
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    // A. Delete Enrollment
    const deleted = await Enrollment.findOneAndDelete({ 
      studentId: student._id, 
      courseOfferingId: offeringId 
    });

    if (!deleted) return res.status(400).json({ error: "Not enrolled in this course." });

    // B. Decrement Seat Count (Fix: using currentEnrollment)
    await CourseOffering.findByIdAndUpdate(offeringId, { $inc: { currentEnrollment: -1 } });

    res.json({ message: "Course dropped successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};