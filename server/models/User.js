const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 1️⃣ IDENTITY (Primary Keys)
  // This acts as Roll Number for Students AND Employee ID for Faculty
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    uppercase: true // "cse-101" becomes "CSE-101" automatically
  },
  
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },

  phone: { 
    type: String, 
    trim: true,
    default: null 
  },

  // 2️⃣ SECURITY & AUTH
  passwordHash: { 
    type: String, 
    required: true 
  },
  
  role: { 
    type: String, 
    enum: ["STUDENT", "FACULTY", "ADMIN", "PRINCIPAL"], // Standardized Enum
    default: "STUDENT",
    required: true
  },

  // 3️⃣ ACCOUNT STATUS & AUDIT
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  lastLogin: { 
    type: Date, 
    default: null 
  },

  // Brute-force protection
  failedLoginAttempts: { 
    type: Number, 
    default: 0 
  },
  
  accountLockedUntil: { 
    type: Date, 
    default: null 
  },

  // 4️⃣ PASSWORD RECOVERY
  resetPasswordToken: { 
    type: String, 
    default: null 
  },
  
  resetPasswordExpires: { 
    type: Date, 
    default: null 
  }

}, { timestamps: true });

// Optional: Virtual field to check if account is currently locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
});

module.exports = mongoose.model("User", userSchema);