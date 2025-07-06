const Booking = require('../models/Booking');
const Tournament = require('../models/Tournament');
const Franchise = require('../models/Franchise');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { tournamentId, eventId, playerName, email, phone, dateOfBirth, gender, tShirtSize, registrationSource, franchiseId } = req.body;

    // Verify the tournament and event exist
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Find the event in the tournament
    const event = tournament.events.id(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if booking is allowed for this event
    if (!event.allowBooking) {
      return res.status(400).json({
        success: false,
        message: 'Booking is not allowed for this event'
      });
    }

    // Create the booking
    const booking = await Booking.create({
      tournament: tournamentId,
      event: eventId,
      playerName,
      email,
      phone,
      dateOfBirth,
      gender,
      tShirtSize,
      status: 'Pending',
      registrationSource: registrationSource || 'online', // Default to online if not specified
      franchise: franchiseId || null // Add franchise field
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Remove a team from a franchise
exports.removeTeamFromFranchise = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Verify the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Update the booking to remove franchise association
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { franchise: null },
      { new: true, runValidators: false }
    );
    
    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error in removeTeamFromFranchise:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.associateTeamWithFranchise = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { franchiseId } = req.body;
    
    // console.log('Associating team with franchise:', { bookingId, franchiseId });

    // Verify the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // console.log('Booking found:', booking);

    // Verify the franchise exists
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found'
      });
    }
    
    // console.log('Franchise found:', franchise);

    // Update the booking with the franchise ID using findByIdAndUpdate to bypass validation
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { franchise: franchiseId },
      { new: true, runValidators: false }
    );
    
    // console.log('Booking updated successfully');

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error in associateTeamWithFranchise:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get all franchises for a tournament
exports.getTournamentFranchises = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Verify the tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Get all franchises for this tournament
    const franchises = await Franchise.find({ tournament: tournamentId });

    res.status(200).json({
      success: true,
      count: franchises.length,
      data: franchises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ... rest of the controller remains the same

// Get all bookings for a tournament (for organizers)
exports.getTournamentBookings = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Verify the tournament exists and belongs to the organizer
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
        message: 'Not authorized to access bookings for this tournament'
      });
    }

    // Get all bookings for this tournament
    const bookings = await Booking.find({ tournament: tournamentId });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update booking status (for organizers)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Verify the booking exists
    let booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify the tournament belongs to the organizer
    const tournament = await Tournament.findById(booking.tournament);
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
        message: 'Not authorized to update this booking'
      });
    }

    // Update the booking status
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// ... existing code ...

// Get all players for a tournament
exports.getTournamentPlayers = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Verify the tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Get all bookings (players) for this tournament with populated franchise information
    const bookings = await Booking.find({ tournament: tournamentId }).populate('franchise', 'franchiseName');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update team event
exports.updateTeamEvent = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { eventId } = req.body;
    
    // Verify the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Verify the event exists in the tournament
    const tournament = await Tournament.findById(booking.tournament);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    const eventExists = tournament.events.some(event => event._id.toString() === eventId);
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        message: 'Event not found in this tournament'
      });
    }
    
    // Update the booking with the new event ID
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { event: eventId },
      { new: true, runValidators: false }
    );
    
    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error in updateTeamEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};