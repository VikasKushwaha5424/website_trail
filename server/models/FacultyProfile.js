const mongoose = require("mongoose");

const facultyProfileSchema = new mongoose.Schema({
  // 1️⃣ IDENTITY (Link to Login)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  
  // 2️⃣ PERSONAL DETAILS
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  profilePhoto: { 
    type: String, 
    default: null 
  }, // URL to S3/Cloudinary

  // 3️⃣ ACADEMIC & HR INFO
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department", 
    required: true 
  },
  
  designation: { 
    type: String, 
    required: true,
    enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Lab Assistant"],
    default: "Assistant Professor" 
  },
  
  qualification: { 
    type: String, 
    required: true 
  }, // e.g., "Ph.D. in AI"
  
  experience: { 
    type: Number, 
    default: 0 
  }, // In Years
  
  joiningDate: { 
    type: Date, 
    required: true 
  },

  employmentType: {
    type: String,
    enum: ["PERMANENT", "GUEST", "CONTRACT"],
    default: "PERMANENT"
  },

  // 4️⃣ CONTACT INFO (Public to Students)
  phone: { 
    type: String, 
    default: null 
  },
  officeLocation: { 
    type: String, 
    default: null 
  } // e.g., "Room 304, Block B"

}, { timestamps: true });

// Index for fast searching by name or department
facultyProfileSchema.index({ firstName: 1, lastName: 1 });
facultyProfileSchema.index({ departmentId: 1 });

module.exports = mongoose.model("FacultyProfile", facultyProfileSchema);