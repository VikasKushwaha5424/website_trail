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

  // 🕒 STORE AS MINUTES FROM MIDNIGHT (e.g., 9:00 AM = 540, 2:30 PM = 870)
  // This allows correct sorting (e.g. 540 < 600) and easier math for duration/overlaps
  startTime: { type: Number, required: true }, 
  endTime: { type: Number, required: true },

  roomNumber: { type: String, required: true }, // e.g., "LH-101"

  // Optional: For temporary rescheduling
  isCancelled: { type: Boolean, default: false }

}, { timestamps: true });

// 🛡️ Conflict Check Index
// Ensure a Room isn't double-booked at the exact same start time on the same day
// (Note: Complex overlapping ranges are handled by logic in adminController.js)
timetableSchema.index({ roomNumber: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);