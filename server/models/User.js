const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // PRIMARY KEY (Used for Login)
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  
  // SECURITY FIELDS
  passwordHash: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    default: ""
  },
  
  // ACCOUNT STATUS FIELDS
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  
  // PASSWORD RECOVERY
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
  },

  // ROLES
  role: {
    type: String,
    required: true,
    enum: ["Student", "Admin", "Instructor", "Principal"], 
    default: "Student"
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);