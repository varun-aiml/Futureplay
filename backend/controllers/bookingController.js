const Booking = require('../models/Booking');
const Tournament = require('../models/Tournament');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { tournamentId, eventId, playerName, email, phone } = req.body;

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
      status: 'Pending'
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