const Feedback = require("../models/Feedback");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile");

// 1. STUDENT: Submit Feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { courseOfferingId, rating, comment } = req.body;
    
    // Get Student Profile ID from User ID
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    // Verify Enrollment (Can only rate classes they take)
    const isEnrolled = await Enrollment.findOne({ 
      studentId: student._id, 
      courseOfferingId 
    });
    
    if (!isEnrolled) {
      return res.status(403).json({ error: "You are not enrolled in this course." });
    }

    await Feedback.create({
      courseOfferingId,
      studentId: student._id,
      rating,
      comment
    });

    res.status(201).json({ message: "Feedback Submitted Successfully!" });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "You have already submitted feedback for this course." });
    }
    res.status(500).json({ error: err.message });
  }
};

// 2. ADMIN: Get Aggregated Stats
exports.getFeedbackStats = async (req, res) => {
  try {
    // Aggregate ratings grouped by Course Offering (Faculty)
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: "$courseOfferingId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
          comments: { $push: "$comment" } // Collect comments array
        }
      },
      {
        $lookup: {
          from: "courseofferings",
          localField: "_id",
          foreignField: "_id",
          as: "offering"
        }
      },
      { $unwind: "$offering" },
      {
        $lookup: {
          from: "courses",
          localField: "offering.courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      {
        $lookup: {
          from: "facultyprofiles",
          localField: "offering.facultyId",
          foreignField: "_id",
          as: "faculty"
        }
      },
      {
        $project: {
          courseName: { $arrayElemAt: ["$course.name", 0] },
          facultyName: { $concat: [ 
             { $arrayElemAt: ["$faculty.firstName", 0] }, " ", 
             { $arrayElemAt: ["$faculty.lastName", 0] } 
          ]},
          avgRating: 1,
          count: 1,
          comments: 1
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};