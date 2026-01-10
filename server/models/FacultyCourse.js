const mongoose = require("mongoose");

// Which Faculty teaches which Course?
const facultyCourseSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacultyProfile",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  section: { type: String, default: "A" } // If you have multiple sections
});

module.exports = mongoose.model("FacultyCourse", facultyCourseSchema);