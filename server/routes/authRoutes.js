const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Middleware to verify JWT token

// Import Controller Functions
const { 
  registerUser, 
  loginUser, 
  googleLogin,
  changePassword, // 👈 New Import
  getMe           // 👈 New Import
} = require("../controllers/authController");

// ==========================================
// 🚦 PUBLIC ROUTES (No Token Required)
// ==========================================

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/google-login
router.post("/google-login", googleLogin);

// ==========================================
// 🔒 PROTECTED ROUTES (Token Required)
// ==========================================

// GET /api/auth/me - Get current user profile (useful for settings page)
router.get("/me", protect, getMe);

// POST /api/auth/change-password - Change user password
router.post("/change-password", protect, changePassword);

module.exports = router;