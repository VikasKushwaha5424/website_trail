const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 1️⃣ IDENTITY
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // Replaces 'username' from your old code to match the Controller's 'rollNumber'
  rollNumber: { 
    type: String, 
    uppercase: true,
    trim: true,
    // We make it sparse/optional because 'Admin' might not always have one
    sparse: true 
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
    // We allow BOTH uppercase and lowercase to prevent "validation failed" errors
    enum: ["student", "STUDENT", "faculty", "FACULTY", "admin", "ADMIN", "principal", "PRINCIPAL"], 
    default: "student",
    required: true
  },

  // 3️⃣ ACCOUNT STATUS
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  lastLogin: { 
    type: Date, 
    default: null 
  },

  // Brute-force protection (Kept from your old code - Good idea!)
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

// Optional: Helper to check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
});

module.exports = mongoose.model("User", userSchema);