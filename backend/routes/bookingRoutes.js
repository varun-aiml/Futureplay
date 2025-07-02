const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking,
  getTournamentBookings,
  updateBookingStatus,
  associateTeamWithFranchise,
  removeTeamFromFranchise,
  getTournamentFranchises
} = require('../controllers/bookingController');

// Public route for creating bookings
router.post('/', createBooking);

// Protected routes for organizers
router.use(protect);
router.get('/tournament/:tournamentId', getTournamentBookings);
router.put('/:bookingId', updateBookingStatus);

// New routes for franchise-team association
router.put('/:bookingId/franchise', associateTeamWithFranchise);
router.delete('/:bookingId/franchise', removeTeamFromFranchise);
router.get('/tournament/:tournamentId/franchises', getTournamentFranchises);

module.exports = router;