const mongoose = require("mongoose");

// Which Student is taking which Course?
const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  }
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);