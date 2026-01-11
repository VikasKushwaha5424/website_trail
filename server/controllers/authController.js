const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// HELPER: Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "fallback_secret", {
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

    if (!user) {
        return res.status(404).json({ message: "Roll Number not found" });
    }
    
    if (!user.isActive) {
        return res.status(403).json({ message: "Account Inactive" });
    }

    // 2. ✅ CHECK PASSWORD CORRECTLY (Using bcrypt)
    // "password" is what they typed (123456)
    // "user.passwordHash" is the scrambled database version
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
       return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Success
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ==========================================
// OPTION 2: GOOGLE LOGIN (Email Only)
// ==========================================
exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Find user by Email
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Google email not found in database." });
    if (!user.isActive) return res.status(403).json({ message: "Account Inactive" });

    // 2. Success
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Google Login successful",
      token: token,
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};