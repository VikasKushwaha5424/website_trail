const User = require("../models/User");

exports.loginUser = async (req, res) => {
  try {
    // 1. Accept rollNumber instead of userId
    const { rollNumber, password } = req.body;

    // 2. Find user by rollNumber
    const user = await User.findOne({ rollNumber });
    if (!user) {
      return res.status(404).json({ message: "Roll Number not found" });
    }

    // 3. Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive. Contact Admin." });
    }

    // 4. Validate Password (comparing against passwordHash)
    if (user.passwordHash !== password) {
      
      // Optional: Increment login attempts here
      user.loginAttempts += 1;
      await user.save();

      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 5. Success! Reset attempts and update login time
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