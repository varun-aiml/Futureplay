const Auction = require('../models/Auction');
const Tournament = require('../models/Tournament');

// Create a new auction
exports.createAuction = async (req, res) => {
  try {
    const { tournamentId, numberOfPoints, playersPerTeam, auctionTime, auctionDate } = req.body;

    // Verify the tournament exists
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
        message: 'Not authorized to create auction for this tournament'
      });
    }

    // Create the auction
    const auction = await Auction.create({
      tournament: tournamentId,
      tournamentName: tournament.name,
      organizer: req.user._id,
      numberOfPoints,
      playersPerTeam,
      auctionTime,
      auctionDate
    });

    res.status(201).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all auctions for the logged-in organizer
exports.getOrganizerAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ organizer: req.user._id });
    res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get a single auction by ID
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if the auction belongs to the logged-in organizer
    if (auction.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this auction'
      });
    }

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update an auction
exports.updateAuction = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if the auction belongs to the logged-in organizer
    if (auction.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this auction'
      });
    }

    auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete an auction
exports.deleteAuction = async (req, res) => {
    try {
      const auction = await Auction.findById(req.params.id);
  
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }
  
      // Check if the auction belongs to the logged-in organizer
      if (auction.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this auction'
        });
      }
  
      // Replace auction.remove() with findByIdAndDelete
      await Auction.findByIdAndDelete(req.params.id);
  
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };

  // Get auctions for a specific tournament
exports.getTournamentAuctions = async (req, res) => {
    try {
      const auctions = await Auction.find({ tournament: req.params.tournamentId });
      res.status(200).json({
        success: true,
        count: auctions.length,
        data: auctions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };
  
  // Get today's auctions for a specific tournament
  exports.getTodayAuctions = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      const auctions = await Auction.find({
        tournament: req.params.tournamentId,
        auctionDate: {
          $gte: today,
          $lt: tomorrow
        }
      });
  
      res.status(200).json({
        success: true,
        count: auctions.length,
        data: auctions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };
  
  // Get upcoming auctions for a specific tournament
  exports.getUpcomingAuctions = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      const auctions = await Auction.find({
        tournament: req.params.tournamentId,
        auctionDate: {
          $gte: tomorrow
        }
      });
  
      res.status(200).json({
        success: true,
        count: auctions.length,
        data: auctions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };