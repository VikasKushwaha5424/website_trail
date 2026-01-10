const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  examType: {
    type: String,
    enum: ["Internal 1", "Internal 2", "Final", "Lab", "Assignment"],
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Marks", marksSchema);