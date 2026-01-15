const mongoose = require("mongoose");

const courseOfferingSchema = new mongoose.Schema({
  // 1️⃣ WHAT IS BEING TAUGHT?
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course", 
    required: true 
  },
  
  // 2️⃣ WHO IS TEACHING IT?
  facultyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "FacultyProfile", 
    required: true 
  },

  // 3️⃣ WHEN IS IT HAPPENING?
  semesterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Semester", 
    required: true 
  },
  
  // 4️⃣ LOGISTICS
  section: { 
    type: String, 
    default: "A", 
    uppercase: true 
  }, 

  roomNumber: { 
    type: String, 
    default: "TBD" 
  }, 

  // =========================================================
  // 5️⃣ ELECTIVE & SEAT MANAGEMENT (👈 New Fields Added)
  // =========================================================
  
  isElective: { 
    type: Boolean, 
    default: false 
  },

  isOpen: { 
    type: Boolean, 
    default: true // Admin can toggle this to stop registration
  },

  // Renamed from 'capacity' to match Elective Logic
  maxSeats: {
    type: Number,
    default: 60
  },

  // Renamed from 'currentEnrollment' to match Elective Logic
  enrolledCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// 🛡️ INDEX 1: Prevent duplicate sections 
courseOfferingSchema.index({ courseId: 1, section: 1, semesterId: 1 }, { unique: true });

// 🛡️ INDEX 2: Prevent Race Condition in Faculty Assignment
courseOfferingSchema.index({ facultyId: 1, courseId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model("CourseOffering", courseOfferingSchema);