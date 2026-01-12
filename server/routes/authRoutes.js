const express = require("express");
const router = express.Router();

// Import Controller Functions
const { 
  registerUser, 
  loginUser, 
  googleLogin 
} = require("../controllers/authController");

// ==========================================
// 🚦 PUBLIC ROUTES (No Login Required)
// ==========================================

// POST /api/auth/register
// Register a new user
router.post("/register", registerUser);

// POST /api/auth/login
// Login with Username/Email & Password
router.post("/login", loginUser);

// POST /api/auth/google-login
// Login with Google (Email only)
router.post("/google-login", googleLogin);

module.exports = router;