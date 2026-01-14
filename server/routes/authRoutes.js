const express = require("express");
const router = express.Router();

// Import Controller Functions
// ⚠️ IMPORTANT: These names must match the exports in authController.js exactly
const { 
  registerUser, 
  loginUser, 
  googleLogin 
} = require("../controllers/authController");

// ==========================================
// 🚦 PUBLIC ROUTES
// ==========================================

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/google-login
router.post("/google-login", googleLogin);

module.exports = router;