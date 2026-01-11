const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// HELPER: Generate JWT Token
const generateToken = (id, role, username) => {
  return jwt.sign(
    { id, role, username }, 
    process.env.JWT_SECRET || "fallback_secret", 
    { expiresIn: "1d" }
  );
};

// ==========================================
// 1. UNIVERSAL LOGIN (Username/Email + Password)
// ==========================================
exports.loginUser = async (req, res) => {
  // We accept "username" (which can be Roll No, Email, or Emp ID)
  // This allows the frontend to send { username: "CSE2025001" ... }
  const { username, password } = req.body;

  try {
    // 🔍 STEP 1: Find User (Allow Login by Username OR Email)
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔒 STEP 2: Security Checks
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled. Contact Admin." });
    }
    
    // Check if account is locked (Level-2 Feature)
    if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
      return res.status(403).json({ 
        message: "Account is temporarily locked due to failed attempts. Try later." 
      });
    }

    // 🔑 STEP 3: Verify Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      // TODO: Increment failedLoginAttempts here for Level-3 security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ STEP 4: Success - Generate Token
    const token = generateToken(user._id, user.role, user.username);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
        // NOTE: 'name' is NOT returned here. 
        // Frontend must call GET /api/student/profile to get the name.
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error during login" });
  }
};

// ==========================================
// 2. GOOGLE LOGIN (Email Only)
// ==========================================
exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Find user by Email only
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Google email not linked to any account." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled." });
    }

    // ✅ Success
    const token = generateToken(user._id, user.role, user.username);

    res.status(200).json({
      success: true,
      message: "Google Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Server Error during Google login" });
  }
};