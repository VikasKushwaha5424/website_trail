const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema({
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },
  semesterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Semester", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  
  // 🕒 STORE AS MINUTES FROM MIDNIGHT (e.g., 9:00 AM -> 540)
  // This standardizes time comparison across the app
  startTime: { 
    type: Number, 
    required: true 
  },
  endTime: { 
    type: Number, 
    required: true 
  },
  
  roomNumber: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);