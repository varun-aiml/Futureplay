const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP } = require('../controllers/authcontroller.js');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/verify-otp', protect, verifyOTP);
router.post('/resend-otp', protect, resendOTP);

module.exports = router;