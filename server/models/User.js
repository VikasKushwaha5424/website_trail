const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["student", "faculty", "admin"], 
    default: "student" 
  },
  rollNumber: { type: String }, 
  isActive: { type: Boolean, default: true },
  
  // ✅ FIX: Added profilePicture field
  profilePicture: { 
    type: String, 
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);