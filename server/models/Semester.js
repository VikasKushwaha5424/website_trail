const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Fall 2025" or "Sem-5"
  code: { type: String, required: true, unique: true }, // e.g., "2025-ODD"
  academicYear: { type: String, required: true }, // e.g., "2025-2026"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Semester", semesterSchema);