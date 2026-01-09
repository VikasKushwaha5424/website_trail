const User = require("../models/User");

// 1. MANUAL LOGIN (Uses Roll Number)
exports.loginUser = async (req, res) => {
  try {
    // REVERTED: Accept rollNumber
    const { rollNumber, password } = req.body;

    // REVERTED: Find by rollNumber
    const user = await User.findOne({ rollNumber });
    
    if (!user) {
      return res.status(404).json({ message: "Roll Number not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive. Contact Admin." });
    }

    if (user.passwordHash !== password) {
      user.loginAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      user: {
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (err) {
    res.status(500).json(err);
  }
};

// 2. GOOGLE LOGIN (Uses Email)
exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by EMAIL (Google only gives us email)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "This Google Email is not linked to any account." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive." });
    }

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: "Google Login successful",
      user: {
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role, 
        lastLogin: user.lastLogin
      }
    });

  } catch (err) {
    res.status(500).json(err);
  }
};