const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // No two people can have the same ID
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["STUDENT", "OFFICE", "TEACHER", "MENTOR", "HOD", "PRINCIPAL"], // Restrict to these roles
    default: "STUDENT"
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);