const CourseOffering = require("../models/CourseOffering");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile");

// 1. GET AVAILABLE ELECTIVES
exports.getElectives = async (req, res) => {
  try {
    const { semesterId } = req.query; // e.g., "FALL2025"
    
    // Find courses marked as Elective for this semester
    const electives = await CourseOffering.find({ 
      semesterId, 
      isElective: true,
      isOpen: true 
    }).populate("courseId", "name code credits description")
      .populate("facultyId", "firstName lastName");

    // Also fetch what the student has ALREADY picked (to disable buttons)
    const student = await StudentProfile.findOne({ userId: req.user.id });
    const myEnrollments = await Enrollment.find({ 
      studentId: student._id 
    }).select("courseOfferingId");

    const myCourseIds = myEnrollments.map(e => e.courseOfferingId.toString());

    res.json({ electives, myCourseIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. ENROLL (With Concurrency Check)
exports.enrollElective = async (req, res) => {
  try {
    const { offeringId } = req.body;
    const student = await StudentProfile.findOne({ userId: req.user.id });

    // A. Check if already enrolled in THIS course
    const existing = await Enrollment.findOne({ studentId: student._id, courseOfferingId: offeringId });
    if (existing) return res.status(400).json({ error: "Already enrolled." });

    // B. ATOMIC UPDATE (The Magic Line 🪄)
    // We try to increment count ONLY IF count is currently less than maxSeats
    // and if the course is open.
    const course = await CourseOffering.findOneAndUpdate(
      { 
        _id: offeringId, 
        isOpen: true,
        $expr: { $lt: ["$enrolledCount", "$maxSeats"] } // Validates seat limit in DB layer
      },
      { $inc: { enrolledCount: 1 } }, // Atomic Increment
      { new: true }
    );

    if (!course) {
      return res.status(400).json({ error: "Enrollment Failed: Class is Full or Closed." });
    }

    // C. Create Enrollment Record
    await Enrollment.create({
      studentId: student._id,
      courseOfferingId: offeringId,
      enrollmentDate: new Date()
    });

    res.json({ message: "Success! Seat reserved.", course });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. DROP ELECTIVE
exports.dropElective = async (req, res) => {
  try {
    const { offeringId } = req.body;
    const student = await StudentProfile.findOne({ userId: req.user.id });

    // A. Delete Enrollment
    const deleted = await Enrollment.findOneAndDelete({ 
      studentId: student._id, 
      courseOfferingId: offeringId 
    });

    if (!deleted) return res.status(400).json({ error: "Not enrolled in this course." });

    // B. Decrement Seat Count
    await CourseOffering.findByIdAndUpdate(offeringId, { $inc: { enrolledCount: -1 } });

    res.json({ message: "Course dropped successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};