const express = require('express');
const router = express.Router();

// Import the controller we just created
const authController = require('../controllers/authController');

// Route Definition: "When POST /login happens, run authController.loginUser"
router.post('/login', authController.loginUser); 

module.exports = router;