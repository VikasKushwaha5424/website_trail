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
  // 🔗 LINK TO DEPARTMENT (Needed for logic)
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
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
    type: String, 
    required: true,
  }
});

module.exports = mongoose.model("Course", courseSchema);