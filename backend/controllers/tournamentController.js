const Tournament = require('../models/Tournament');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary (you'll need to add your credentials to .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tournaments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

// Initialize multer upload
const upload = multer({ storage: storage });

// Get all tournaments for the logged-in organizer
exports.getOrganizerTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ organizer: req.user._id });
    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all tournaments (public endpoint)
exports.getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      status: { $in: ['Upcoming', 'Active'] }
    }).sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get a single tournament by ID
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if the tournament belongs to the logged-in organizer
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this tournament'
      });
    }

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create a new tournament
exports.createTournament = async (req, res) => {
  try {
    // Add organizer to the tournament data
    req.body.organizer = req.user._id;

    // Handle file upload if present
    if (req.file) {
      req.body.posterUrl = req.file.secure_url || req.file.path;
    }

    // Parse events JSON if it exists
    if (req.body.events && typeof req.body.events === 'string') {
      req.body.events = JSON.parse(req.body.events);
    }

    const tournament = await Tournament.create(req.body);

    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create tournament',
      error: error.message
    });
  }
};

// Update a tournament
exports.updateTournament = async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if the tournament belongs to the logged-in organizer
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament'
      });
    }

    // Handle file upload if present
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (tournament.posterUrl) {
        const publicId = tournament.posterUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`tournaments/${publicId}`);
      }
      req.body.posterUrl = req.file.secure_url || req.file.path;
    }

    // Parse events JSON if it exists
    if (req.body.events && typeof req.body.events === 'string') {
      req.body.events = JSON.parse(req.body.events);
    }

    tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('Tournament update error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update tournament',
      error: error.message,
      details: error.errors // This will include validation errors
    });
  }
};

// Delete a tournament
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if the tournament belongs to the logged-in organizer
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tournament'
      });
    }

    // Delete poster from Cloudinary if exists
    if (tournament.posterUrl) {
      const publicId = tournament.posterUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`tournaments/${publicId}`);
    }

    await Tournament.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete tournament',
      error: error.message
    });
  }
};

// Add an event to a tournament
exports.addEvent = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if the tournament belongs to the logged-in organizer
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament'
      });
    }

    tournament.events.push(req.body);
    await tournament.save();

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add event',
      error: error.message
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if the tournament belongs to the logged-in organizer
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament'
      });
    }

    const eventIndex = tournament.events.findIndex(event => event._id.toString() === req.params.eventId);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    tournament.events[eventIndex] = { ...tournament.events[eventIndex].toObject(), ...req.body };
    await tournament.save();

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if the tournament belongs to the logged-in organizer
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament'
      });
    }

    tournament.events = tournament.events.filter(event => event._id.toString() !== req.params.eventId);
    await tournament.save();

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

exports.getTopTournaments = async (req, res) => {
  try {

    const tournaments = await Tournament.find({
      status: { $in: ['Upcoming', 'Completed'] }
    })
      .sort({ startDate: -1 })
      .limit(5)
      .select('name startDate endDate location posterUrl status'); // Select only needed fields

    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Middleware for handling file uploads
exports.uploadTournamentPoster = upload.single('poster');