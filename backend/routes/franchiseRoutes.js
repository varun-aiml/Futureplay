const express = require('express');
const router = express.Router();
const { registerFranchise, loginFranchise, getAllFranchises, updateFranchiseLogo } = require('../controllers/franchiseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer to use memory storage instead of disk storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.post('/register', upload.single('logo'), registerFranchise);
router.post('/login', loginFranchise);

// Protected route for getting all franchises (only for organizers)
router.get('/', protect, authorize('organizer', 'admin'), getAllFranchises);

// Protected route for updating franchise logo
router.put('/:id/logo', protect, authorize('organizer', 'admin'), upload.single('logo'), updateFranchiseLogo);

module.exports = router;