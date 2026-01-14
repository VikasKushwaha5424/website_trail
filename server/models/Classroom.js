const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true }, // e.g., "LH-101"
  capacity: { type: Number, required: true }, // e.g., 60
  type: { 
    type: String, 
    enum: ["LECTURE_HALL", "LAB", "AUDITORIUM"], 
    default: "LECTURE_HALL" 
  },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Classroom", classroomSchema);