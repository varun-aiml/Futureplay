const Tournament = require('../models/Tournament');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

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

// Add this function to tournamentController.js
exports.updateFixture = async (req, res) => {
  try {
    const { tournamentId, eventId, fixtureData } = req.body;
    
    const tournament = await Tournament.findById(tournamentId);

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

    const eventIndex = tournament.events.findIndex(event => 
      event._id.toString() === eventId
    );

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update the fixtures for this event
    tournament.events[eventIndex].fixtures = [fixtureData];
    
    // Mark the fixture as modified
    tournament.events[eventIndex].fixtures[0].status = 'Modified';
    
    await tournament.save();

    res.status(200).json({
      success: true,
      data: tournament.events[eventIndex].fixtures[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update fixture',
      error: error.message
    });
  }
};

// Get a single tournament by ID
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate({
        path: 'events.fixtures.pools.A',
        model: 'Franchise'
      })
      .populate({
        path: 'events.fixtures.pools.B',
        model: 'Franchise'
      });

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
      status: { $in: ['Upcoming', 'Completed', 'Active'] }
    })
      .sort({ startDate: -1 })
      .limit(10) // Increased limit to accommodate more tournaments
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


// Get a single tournament by ID (public endpoint)
exports.getPublicTournamentById = async (req, res) => {
  try {
    // Change this line to include population
    const tournament = await Tournament.findById(req.params.id)
      .populate({
        path: 'events.fixtures.pools.A',
        model: 'Franchise'
      })
      .populate({
        path: 'events.fixtures.pools.B',
        model: 'Franchise'
      });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
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

// ... existing code ...

// Fixture generation functions
exports.generateKnockoutFixtures = (fixtures, participants) => {
  const participantIds = participants.map(p => p.toString());
  const matches = [];
  const totalRounds = Math.ceil(Math.log2(participantIds.length));
  
  // First round matches
  const firstRoundMatches = Math.pow(2, totalRounds - 1);
  const byes = firstRoundMatches * 2 - participantIds.length;
  
  let matchNumber = 1;
  for (let i = 0; i < firstRoundMatches; i++) {
    const match = {
      round: 1,
      matchNumber: matchNumber++,
      team1: i < participantIds.length ? participantIds[i] : 'BYE',
      team2: i < participantIds.length - byes ? participantIds[participantIds.length - 1 - i] : 'BYE',
      winner: '',
      score: ''
    };
    
    // Auto-advance if there's a bye
    if (match.team1 === 'BYE') match.winner = match.team2;
    if (match.team2 === 'BYE') match.winner = match.team1;
    
    matches.push(match);
  }
  
  // Create placeholder matches for subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatches = Math.pow(2, totalRounds - round);
    for (let i = 0; i < roundMatches; i++) {
      matches.push({
        round: round,
        matchNumber: matchNumber++,
        team1: '',
        team2: '',
        winner: '',
        score: ''
      });
    }
  }
  
  fixtures.matches = matches;
  return fixtures;
};

// Add this function to update pool arrangements
exports.updatePoolArrangements = async (req, res) => {
  try {
    const { tournamentId, eventId, poolsData } = req.body;
    
    if (!tournamentId) {
      return res.status(400).json({ success: false, message: 'Missing tournamentId' });
    }
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Missing eventId' });
    }
    if (!poolsData) {
      return res.status(400).json({ success: false, message: 'Missing poolsData' });
    }
    
    // Find the tournament
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tournament not found' 
      });
    }
    
    // Find the event
    const event = tournament.events.id(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Convert string IDs to ObjectIds
    const processedPoolsData = {
      A: poolsData.A.map(id => new mongoose.Types.ObjectId(id)),
      B: poolsData.B.map(id => new mongoose.Types.ObjectId(id))
    };
    
    // Check if fixtures exist, create if not
    if (!event.fixtures || event.fixtures.length === 0) {
      event.fixtures = [{
        pools: processedPoolsData,
        status: 'Generated',
        matches: [],
        groups: []
      }];
    } else {
      // Update existing fixtures
      event.fixtures[0].pools = processedPoolsData;
    }
    
    try {
      await tournament.save();
      
      // Verify the saved data by retrieving it fresh from the database
      const savedTournament = await Tournament.findById(tournamentId)
        .populate({
          path: 'events.fixtures.pools.A',
          model: 'Franchise'
        })
        .populate({
          path: 'events.fixtures.pools.B',
          model: 'Franchise'
        });
      const savedEvent = savedTournament.events.id(eventId);
      
      // console.log('Tournament saved successfully with pools:', 
      //   JSON.stringify(savedEvent.fixtures[0].pools));
      // console.log('Populated pools data:', 
      //   JSON.stringify(savedEvent.fixtures[0].pools, null, 2));
    } catch (saveError) {
      console.error('Error saving tournament:', saveError);
      return res.status(400).json({
        success: false,
        message: 'Error saving pool data',
        error: saveError.message
      });
    }

    // console.log('After save - event fixtures:', JSON.stringify(event.fixtures));
    
    return res.status(200).json({
      success: true,
      message: 'Pool arrangements updated successfully',
      data: event.fixtures[0].pools
    });
  } catch (error) {
    console.error('Error updating pool arrangements:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.generateLeagueFixtures = (fixtures, participants) => {
  const participantIds = participants.map(p => p.toString());
  const matches = [];
  
  let matchNumber = 1;
  // Round-robin tournament: each participant plays against all others
  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      matches.push({
        round: 1, // All matches are in one round for league
        matchNumber: matchNumber++,
        team1: participantIds[i],
        team2: participantIds[j],
        winner: '',
        score: ''
      });
    }
  }
  
  fixtures.matches = matches;
  return fixtures;
};

exports.generateGroupKnockoutFixtures = (fixtures, participants) => {
  const participantIds = participants.map(p => p.toString());
  const groups = [];
  const numGroups = Math.min(4, Math.ceil(participantIds.length / 3)); // Create up to 4 groups with at least 3 participants each
  
  // Distribute participants into groups
  const participantsPerGroup = Math.ceil(participantIds.length / numGroups);
  for (let i = 0; i < numGroups; i++) {
    const groupTeams = participantIds.slice(i * participantsPerGroup, (i + 1) * participantsPerGroup);
    const groupMatches = [];
    
    // Create round-robin matches within each group
    for (let j = 0; j < groupTeams.length; j++) {
      for (let k = j + 1; k < groupTeams.length; k++) {
        groupMatches.push({
          team1: groupTeams[j],
          team2: groupTeams[k],
          winner: '',
          score: ''
        });
      }
    }
    
    groups.push({
      name: `Group ${String.fromCharCode(65 + i)}`, // Group A, B, C, etc.
      teams: groupTeams,
      matches: groupMatches
    });
  }
  
  // Create knockout stage matches (assuming top 2 from each group advance)
  const knockoutMatches = [];
  const totalKnockoutRounds = Math.ceil(Math.log2(numGroups * 2));
  let matchNumber = 1;
  
  // First round of knockout
  for (let i = 0; i < numGroups; i++) {
    knockoutMatches.push({
      round: 1,
      matchNumber: matchNumber++,
      team1: `Winner Group ${String.fromCharCode(65 + i)}`,
      team2: `Runner-up Group ${String.fromCharCode(65 + ((i + 1) % numGroups))}`,
      winner: '',
      score: ''
    });
  }
  
  // Create placeholder matches for subsequent knockout rounds
  for (let round = 2; round <= totalKnockoutRounds; round++) {
    const roundMatches = Math.pow(2, totalKnockoutRounds - round);
    for (let i = 0; i < roundMatches; i++) {
      knockoutMatches.push({
        round: round,
        matchNumber: matchNumber++,
        team1: '',
        team2: '',
        winner: '',
        score: ''
      });
    }
  }
  
  fixtures.groups = groups;
  fixtures.matches = knockoutMatches;
  return fixtures;
};

// ... existing code ...

// Middleware for handling file uploads
exports.uploadTournamentPoster = upload.single('poster');