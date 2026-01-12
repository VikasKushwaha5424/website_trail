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
  // Crucial for the unique index to distinguish between semesters (e.g. Fall vs Spring)
  semesterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Semester", 
    required: false 
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

  capacity: {
    type: Number,
    default: 60
  },

  // ✅ ATOMIC COUNTER: Prevents enrollment race conditions
  currentEnrollment: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// 🛡️ INDEX 1: Prevent duplicate sections 
// (e.g., You cannot have two "Section A"s for Physics in the same semester)
courseOfferingSchema.index({ courseId: 1, section: 1, semesterId: 1 }, { unique: true });

// 🛡️ INDEX 2: Prevent Race Condition in Faculty Assignment
// (e.g., You cannot assign the same Faculty to the same Course in the same Semester twice)
courseOfferingSchema.index({ facultyId: 1, courseId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model("CourseOffering", courseOfferingSchema);