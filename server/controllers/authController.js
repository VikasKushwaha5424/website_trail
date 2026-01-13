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
    const { name, email, password, rollNumber } = req.body;

    // 2. Check if Email Exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 3. Check if Roll Number Exists
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
    user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: "student", 
      rollNumber,
      isActive: true
    });

    if (user) {
      // 6. Create StudentProfile immediately
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      await StudentProfile.create({
        userId: user._id,
        firstName: firstName,
        lastName: lastName,
        rollNumber: rollNumber,
        departmentId: null, // Pending assignment
        batchYear: new Date().getFullYear(),
        currentStatus: "ACTIVE"
      });

      // 7. Send Welcome Email
      try {
        await sendEmail(email, "Welcome! 🎓", `<h1>Hello ${name}, welcome to the portal.</h1>`);
      } catch (emailErr) {
        console.error("Warning: Failed to send welcome email:", emailErr.message);
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
// 3. GOOGLE LOGIN (IMPLEMENTED)
// ==========================================
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googlePhotoUrl } = req.body;

    // 1. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // 2. If user exists, log them in
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      // 3. Auto-Register New Google User
      
      // Generate a random password since Google users don't use one
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      // Create Base User
      user = await User.create({
        name,
        email,
        passwordHash: hashedPassword,
        role: "student", // Default role
        profilePicture: googlePhotoUrl,
        isActive: true
      });

      // Create Student Profile
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      await StudentProfile.create({
        userId: user._id,
        firstName: firstName,
        lastName: lastName,
        currentStatus: "ACTIVE",
        batchYear: new Date().getFullYear()
      });

      // Return Token
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google Login failed on server" });
  }
};