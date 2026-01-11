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
    ref: "FacultyProfile", // Linking to Profile, NOT User
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
  }, // Section A, B, C

  roomNumber: { 
    type: String, 
    default: "TBD" 
  }, // e.g., "Lab-204"

  capacity: {
    type: Number,
    default: 60
  }

}, { timestamps: true });

// 🛡️ DATA INTEGRITY RULES
// 1. A Faculty cannot teach two classes at the same time (Advanced logic, handled in code)
// 2. We cannot have two "Section A"s for "Physics" in "Fall 2025".
courseOfferingSchema.index({ courseId: 1, semesterId: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("CourseOffering", courseOfferingSchema);