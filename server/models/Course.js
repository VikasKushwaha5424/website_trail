const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  academicYear: {
    type: String, // e.g., "2025-2026"
    required: true,
  }
});

module.exports = mongoose.model("Course", courseSchema);