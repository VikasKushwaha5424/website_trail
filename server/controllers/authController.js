const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ==========================================
// 1. LOGIN USER (Roll Number + Password)
// ==========================================
exports.loginUser = async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    console.log(`🔍 Login Attempt for Roll Number: ${rollNumber}`);

    // 1. Validate Input
    if (!rollNumber || !password) {
      return res.status(400).json({ message: "Please provide Roll Number and Password" });
    }

    // 2. Find User by Roll Number
    const user = await User.findOne({ rollNumber });

    if (!user) {
      console.log("❌ User not found.");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 3. Safety Check: Ensure user has a password set
    // This prevents crashes if you have old data without 'passwordHash'
    if (!user.passwordHash) {
        console.error("❌ Critical Error: User found but 'passwordHash' is missing!");
        return res.status(500).json({ message: "Account data error. Contact Admin." });
    }

    // 4. Verify Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      console.log("❌ Password Mismatch.");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 5. Success!
    console.log("✅ Login Successful!");
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================================
// STUBS (To prevent Route Crashes)
// ==========================================

exports.registerUser = async (req, res) => {
  res.status(403).json({ message: "Registration is currently disabled." });
};

exports.googleLogin = async (req, res) => {
  res.status(403).json({ message: "Google Login is temporarily disabled." });
};