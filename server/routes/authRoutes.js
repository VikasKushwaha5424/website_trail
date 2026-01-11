const express = require("express");
const router = express.Router();
const { loginUser, googleLogin } = require("../controllers/authController");

// @route   POST /api/auth/login
// @desc    Login with Username/Email & Password
// @access  Public
router.post("/login", loginUser);

// @route   POST /api/auth/google-login
// @desc    Login with Google (Email only)
// @access  Public
router.post("/google-login", googleLogin);

module.exports = router;