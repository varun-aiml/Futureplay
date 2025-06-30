const express = require('express');
const router = express.Router();
const { registerFranchise, loginFranchise, getAllFranchises } = require('../controllers/franchiseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerFranchise);
router.post('/login', loginFranchise);

// Protected route for getting all franchises (only for organizers)
router.get('/', protect, authorize('organizer', 'admin'), getAllFranchises);

module.exports = router;