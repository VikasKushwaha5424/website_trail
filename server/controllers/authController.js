const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// HELPER: This generates the "ID Card" (Token) for BOTH login types
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ==========================================
// OPTION 1: MANUAL LOGIN (Roll No + Password)
// ==========================================
exports.loginUser = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    // 1. Find user by Roll Number
    const user = await User.findOne({ rollNumber });

    if (!user) return res.status(404).json({ message: "Roll Number not found" });
    if (!user.isActive) return res.status(403).json({ message: "Account Inactive" });

    // 2. Check Password
    if (user.passwordHash !== password) {
       return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Success: Send back the Token + User Info
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id), // <--- Giving them the token
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// OPTION 2: GOOGLE LOGIN (Email Only)
// ==========================================
exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body; // Frontend sends us the Google Email

    // 1. Find user by Email
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Google email not found in database." });
    if (!user.isActive) return res.status(403).json({ message: "Account Inactive" });

    // 2. Success: Send back the Token + User Info
    // (We also give a token here so Google users can access protected pages!)
    res.status(200).json({
      message: "Google Login successful",
      token: generateToken(user._id), // <--- Giving them the token too!
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};