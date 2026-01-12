const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); // 👈 Added Import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ==========================================
// 1. REGISTER USER
// ==========================================
exports.registerUser = async (req, res) => {
  try {
    // 🔒 SECURITY FIX: Do not extract 'role' from req.body to prevent privilege escalation
    const { name, email, password, rollNumber } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the Base User Account
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: "student", // 🔒 FORCE ROLE TO STUDENT
      rollNumber,
      isActive: true
    });

    if (user) {
      // ✅ FIX: Create StudentProfile immediately to prevent "Zombie" users
      // This ensures the student has a profile to load in the dashboard
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

      await StudentProfile.create({
        userId: user._id,
        firstName: firstName,
        lastName: lastName,
        rollNumber: rollNumber,
        departmentId: null, // Pending assignment (Admin can update later)
        batchYear: new Date().getFullYear(), // Default to current year
        currentStatus: "ACTIVE"
      });

      // 4. Send Welcome Email
      sendEmail(email, "Welcome! 🎓", `<h1>Hello ${name}, welcome to the portal.</h1>`);

      // 5. Return Token
      res.status(201).json({
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
    // Cleanup: If profile creation fails, you might consider deleting the user here (rollback)
    // For now, we return the error
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. LOGIN USER
// ==========================================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

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
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. GOOGLE LOGIN
// ==========================================
exports.googleLogin = async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
};