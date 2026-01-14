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
  startTime: { 
    type: String, // Format "HH:mm" e.g. "09:00"
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  roomNumber: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);