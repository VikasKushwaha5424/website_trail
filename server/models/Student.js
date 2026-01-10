const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  batch: { type: String }, // e.g., "2022-2026"
  semester: { type: Number, default: 1 }
});

module.exports = mongoose.model("Student", studentSchema);