const mongoose = require("mongoose");

const facultyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  qualification: { type: String },
  experience: { type: Number }, // In years
  profilePhoto: { type: String } // URL to image
});

module.exports = mongoose.model("FacultyProfile", facultyProfileSchema);