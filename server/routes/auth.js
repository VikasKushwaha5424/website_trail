const express = require("express");
const router = express.Router();
const User = require("../models/User");

// LOGIN ROUTE
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User ID not found" });
    }

    // 2. Check password (In a real app, we would hash this, but for now we compare plain text as per your sheet)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Login successful - send back the user info (excluding password)
    res.status(200).json({
      message: "Login successful",
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;