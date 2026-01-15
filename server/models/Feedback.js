const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProfile", 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    maxLength: 500 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// Prevent multiple feedbacks for the same course by the same student
feedbackSchema.index({ courseOfferingId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);