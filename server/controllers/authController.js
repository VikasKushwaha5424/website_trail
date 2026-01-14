const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ==========================================
// 1. LOGIN USER (Roll Number + Password ONLY)
// ==========================================
exports.loginUser = async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    // Debug Log: Check what the server receives
    console.log(`🔍 Login Attempt for Roll Number: ${rollNumber}`); 

    // 1. Validate Input
    if (!rollNumber || !password) {
      return res.status(400).json({ message: "Please provide Roll Number and Password" });
    }

    // 2. Find User by Roll Number
    // (We are NOT searching by email anymore)
    const user = await User.findOne({ rollNumber });

    if (!user) {
      console.log("❌ User not found in database.");
      return res.status(401).json({ message: "User not found" });
    }

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (isMatch) {
      console.log("✅ Password Match! Logging in...");
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        token: generateToken(user._id, user.role),
      });
    } else {
      console.log("❌ Password Mismatch.");
      res.status(401).json({ message: "Invalid Password" });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// STUBS (Placeholders to prevent crashes)
// ==========================================
// We keep these functions so your routes don't break, 
// but they simply return a message saying they are disabled.

exports.registerUser = async (req, res) => {
  res.status(403).json({ message: "Registration is currently disabled." });
};

exports.googleLogin = async (req, res) => {
  res.status(403).json({ message: "Google Login is temporarily disabled." });
};