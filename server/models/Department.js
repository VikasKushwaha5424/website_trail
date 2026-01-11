const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  // 1️⃣ IDENTITY
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true // Auto-removes spaces: " CSE " -> "CSE"
  }, 
  // e.g., "Computer Science & Engineering"

  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, // Auto-converts "cse" -> "CSE"
    trim: true
  }, 
  // e.g., "CSE"

  // 2️⃣ CONTROL (Level-2 Feature)
  isActive: { 
    type: Boolean, 
    default: true 
  }
  // If a department closes, set this to false instead of deleting it.
  // This keeps old student records safe.

}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);