const mongoose = require("mongoose");

const facultyCourseSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ Correct: Matches 'facultyUser._id' in your seed script
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  // (Optional) You can keep 'section' if you want to track Section A/B later
  section: { 
    type: String, 
    default: "A" 
  }
}, { timestamps: true });

module.exports = mongoose.model("FacultyCourse", facultyCourseSchema);