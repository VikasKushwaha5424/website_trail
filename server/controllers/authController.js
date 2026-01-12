const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ==========================================
// 1. REGISTER USER (With Validation & Rollback)
// ==========================================
exports.registerUser = async (req, res) => {
  // 1️⃣ Declare user outside 'try' so it is accessible in 'catch'
  let user = null; 

  try {
    // 🔒 SECURITY: We extract only specific fields. 
    // We intentionally DO NOT extract 'role' from req.body to prevent privilege escalation.
    const { name, email, password, rollNumber } = req.body;

    // 2. Check if Email Exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 3. ✅ FIX: Check if Roll Number Exists
    if (rollNumber) {
        const rollExists = await User.findOne({ rollNumber });
        if (rollExists) {
            return res.status(400).json({ message: "Roll Number already registered" });
        }
    }

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create the Base User Account
    // Assign to the variable declared outside
    user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      // 🔒 SECURITY FORCE: Public registration is RESTRICTED to students only.
      // To create Faculty/Admins, use 'adminController.addUser' which requires admin token.
      role: "student", 
      rollNumber,
      isActive: true
    });

    if (user) {
      // 6. Create StudentProfile immediately
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

      // 7. Send Welcome Email
      // Note: If email fails, the catch block will trigger rollback.
      try {
        await sendEmail(email, "Welcome! 🎓", `<h1>Hello ${name}, welcome to the portal.</h1>`);
      } catch (emailErr) {
        console.error("Warning: Failed to send welcome email:", emailErr.message);
        // We do NOT rollback user creation just because email failed
      }

      // 8. Return Token
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

    // 🛑 ROLLBACK: Delete the 'Zombie' User if profile creation failed
    if (user) {
        console.log("Creation failed. Rolling back user:", user._id);
        await User.findByIdAndDelete(user._id);
    }

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