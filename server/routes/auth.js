const express = require('express');
const router = express.Router();

// Import the controller
const authController = require('../controllers/authController');

// 1. Manual Login Route
router.post('/login', authController.loginUser); 

// 2. Google Login Route (THIS WAS LIKELY MISSING)
router.post('/google-login', authController.googleLogin); 

module.exports = router;