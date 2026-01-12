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
  // ✅ FIX: Changed required to 'false' to prevent crashes until Semesters are fully implemented
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

// 🛡️ DATA INTEGRITY
// Note: Removed 'semesterId' from unique index temporarily to match the optional field
courseOfferingSchema.index({ courseId: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("CourseOffering", courseOfferingSchema);