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
// 2. CHANGE PASSWORD (Manual Hashing)
// ==========================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords" });
    }

    // 2. Get User (req.user.id comes from authMiddleware)
    // We explicitly fetch the user to ensure we have the passwordHash
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // 4. Hash the New Password Manually
    // We do this here because your User model does not have a pre-save hook for 'password'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5. Update the passwordHash field directly
    user.passwordHash = hashedPassword;
    
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 3. GET CURRENT USER (For Context/Settings)
// ==========================================
exports.getMe = async (req, res) => {
  try {
    // req.user.id is populated by the protect middleware
    const user = await User.findById(req.user.id).select("-passwordHash"); // Exclude password hash
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get Me Error:", err);
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