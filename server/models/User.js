const mongoose = require("mongoose");
const { ROLES } = require("../config/roles"); // 👈 Import

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    // ✅ FIX: Use constants instead of hardcoded strings
    enum: [ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN], 
    default: ROLES.STUDENT 
  },
  rollNumber: { type: String }, 
  isActive: { type: Boolean, default: true },
  profilePicture: { 
    type: String, 
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);