const Feedback = require("../models/Feedback");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile");
const FacultyProfile = require("../models/FacultyProfile"); 
const CourseOffering = require("../models/CourseOffering"); 

// =========================================================
// 1. STUDENT: Submit Feedback
// =========================================================
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

// =========================================================
// 2. ADMIN: Get Aggregated Stats (Global View)
// =========================================================
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

// =========================================================
// 3. FACULTY: Get My Performance Stats (Personal View)
// =========================================================
exports.getFacultyFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the Faculty Profile
    const faculty = await FacultyProfile.findOne({ userId });
    if (!faculty) return res.status(404).json({ error: "Faculty profile not found" });

    // 2. Find all Course Offerings taught by this Faculty
    const myOfferings = await CourseOffering.find({ facultyId: faculty._id }).select("_id");
    const offeringIds = myOfferings.map(o => o._id);

    // 3. Aggregate Feedback for these offerings
    const stats = await Feedback.aggregate([
      // Filter: Only feedback for my courses
      { $match: { courseOfferingId: { $in: offeringIds } } },
      
      // Group by Course Offering
      {
        $group: {
          _id: "$courseOfferingId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          comments: { $push: "$comment" } // Collect anonymous comments
        }
      },
      
      // Join with Course Details (to get Name/Code)
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
      { $unwind: "$course" },

      // Format the Output
      {
        $project: {
          courseName: "$course.name",
          courseCode: "$course.code",
          averageRating: { $round: ["$averageRating", 1] }, // Round to 1 decimal place
          totalReviews: 1,
          comments: {
             $filter: { 
               input: "$comments", 
               as: "c", 
               cond: { $ne: ["$$c", null] } // Remove null comments
             }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error("Feedback Error:", err);
    res.status(500).json({ error: err.message });
  }
};