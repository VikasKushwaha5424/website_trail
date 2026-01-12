const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService"); // 🚀 LEVEL 3 IMPORT

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// =========================================================
// 1. REGISTER USER
// =========================================================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User in Database
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: role || "student", // Default to student if empty
      rollNumber,
      isActive: true
    });

    if (user) {
      // 🚀 LEVEL 3 UPGRADE: Send Welcome Email
      const emailSubject = "Welcome to College Portal! 🎓";
      const emailBody = `
        <h1>Hello ${name},</h1>
        <p>Your account has been successfully created.</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p>Please login to complete your profile.</p>
      `;
      
      // Fire and forget (don't await to keep response fast)
      sendEmail(email, emailSubject, emailBody);

      // Success! 
      // Note: We return a message prompting them to check email, 
      // but we also return the token so they are logged in immediately (Best UX).
      res.status(201).json({
        message: "User registered successfully. Welcome email sent!",
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================================================
// 2. LOGIN USER
// =========================================================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Check password matches the hash
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========================================================
// 3. GOOGLE LOGIN (Placeholder)
// =========================================================
exports.googleLogin = async (req, res) => {
    res.status(501).json({ message: "Google Login not implemented yet" });
};
