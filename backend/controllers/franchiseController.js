const Franchise = require('../models/Franchise');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// @desc    Register a new franchise owner
// @route   POST /api/franchise/register
// @access  Public
exports.registerFranchise = async (req, res) => {
  try {
    const { franchiseName, ownerName, username, password, whatsappNumber, tournament } = req.body;

    // Check if username already exists
    const franchiseExists = await Franchise.findOne({ username });
    if (franchiseExists) {
      return res.status(400).json({
        success: false,
        message: "Franchise with this username already exists",
      });
    }
    
    // Handle logo upload if present
    let logoUrl = '';
    if (req.file) {
      // Convert buffer to base64 string for Cloudinary
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(fileStr, {
        folder: 'franchise_logos',
        width: 150,
        crop: "scale"
      });
      logoUrl = result.secure_url;
    }

    // Create new franchise
    const franchise = await Franchise.create({
      franchiseName,
      ownerName,
      username,
      password,
      whatsappNumber,
      tournament,
      logoUrl
    });

    // Generate JWT token
    const token = generateToken(franchise._id);

    // Remove password from output
    franchise.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Franchise registration successful!',
      token,
      franchise
    });
  } catch (error) {
    console.error('Franchise registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during franchise registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update franchise logo
// @route   PUT /api/franchise/:id/logo
// @access  Private (only for organizers)
exports.updateFranchiseLogo = async (req, res) => {
try {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a logo image'
    });
  }

  // Convert buffer to base64 string for Cloudinary
  const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  
  // Upload to cloudinary
  const result = await cloudinary.uploader.upload(fileStr, {
    folder: 'franchise_logos',
    width: 150,
    crop: "scale"
  });

  // Update franchise with new logo URL
  const franchise = await Franchise.findByIdAndUpdate(
    req.params.id,
    { logoUrl: result.secure_url },
    { new: true }
  );

  if (!franchise) {
    return res.status(404).json({
      success: false,
      message: 'Franchise not found'
    });
  }

  res.status(200).json({
    success: true,
    franchise
  });
} catch (error) {
  console.error('Franchise logo update error:', error);
  res.status(500).json({
    success: false,
    message: 'Server error during franchise logo update',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
};

// @desc    Login franchise owner
// @route   POST /api/franchise/login
// @access  Public
exports.loginFranchise = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if username and password are provided
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide username and password",
        });
      }
  
      // Find franchise by username and include password in the result
      const franchise = await Franchise.findOne({ username }).select("+password");
  
      // Check if franchise exists and password is correct
      if (!franchise || !(await franchise.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }
  
      // Generate JWT token
      const token = generateToken(franchise._id);
  
      // Remove password from output
      franchise.password = undefined;
  
      res.status(200).json({
        success: true,
        token,
        franchise: {
          _id: franchise._id,
          franchiseName: franchise.franchiseName,
          ownerName: franchise.ownerName,
          username: franchise.username,
          whatsappNumber: franchise.whatsappNumber,
          tournament: franchise.tournament
        },
      });
    } catch (error) {
      console.error('Franchise login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during franchise login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

// @desc    Get all franchises
// @route   GET /api/franchise
// @access  Private (only for organizers)
exports.getAllFranchises = async (req, res) => {
  try {
    // Find all tournaments created by the current organizer
    const Tournament = require('../models/Tournament');
    const organizerTournaments = await Tournament.find({ organizer: req.user._id });
    
    // Get the IDs of these tournaments
    const tournamentIds = organizerTournaments.map(tournament => tournament._id);
    
    // Find franchises that belong to these tournaments
    const franchises = await Franchise.find({ tournament: { $in: tournamentIds } }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: franchises.length,
      franchises
    });
  } catch (error) {
    console.error('Get franchises error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching franchises',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};