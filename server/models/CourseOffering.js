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
  // Note: While 'required' is false for flexibility, this field is crucial 
  // for the unique index below to work across different terms.
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
  }

}, { timestamps: true });

// 🛡️ DATA INTEGRITY FIX
// We must include 'semesterId' in the unique index. 
// This allows "Physics Sec A" to exist in Fall 2024 AND Spring 2025 independently.
// Without 'semesterId', the database would block the second offering.
courseOfferingSchema.index({ courseId: 1, section: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model("CourseOffering", courseOfferingSchema);