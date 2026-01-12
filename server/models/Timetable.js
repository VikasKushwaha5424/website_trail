const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  // Link to the specific class instance
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },

  dayOfWeek: {
    type: String,
    enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
    required: true
  },

  // 24-Hour Format (e.g., 900 for 9:00 AM, 1430 for 2:30 PM)
  startTime: { type: Number, required: true }, 
  endTime: { type: Number, required: true },

  roomNumber: { type: String, required: true }, // e.g., "LH-101"

  // Optional: For temporary rescheduling
  isCancelled: { type: Boolean, default: false }

}, { timestamps: true });

// 🛡️ Conflict Check Index
// Ensure a Room isn't double-booked at the same time on the same day
// (Note: This is a basic index; complex overlaps need code-level validation)
timetableSchema.index({ roomNumber: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);