const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrganizerTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  addEvent,
  updateEvent,
  deleteEvent,
  uploadTournamentPoster,
  getTopTournaments,
  getAllTournaments,
  getPublicTournamentById,
  updateFixture,
  updatePoolArrangements
} = require('../controllers/tournamentController');

// Public routes
router.get('/top', getTopTournaments);
router.get('/all', getAllTournaments);
router.get('/public/:id', getPublicTournamentById);

// All routes are protected and require authentication
router.use(protect);

// Tournament routes
router.route('/organizer')
  .get(getOrganizerTournaments);

// Specific routes first (before parameterized routes)
router.route('/fixtures')
  .put(updateFixture);

router.route('/pools')
  .put(updatePoolArrangements);

router.route('/')
  .post(uploadTournamentPoster, createTournament);

// Parameterized routes last
router.route('/:id')
  .get(getTournamentById)
  .put(uploadTournamentPoster, updateTournament)
  .delete(deleteTournament);

// Event routes
router.route('/:id/events')
  .post(addEvent);

router.route('/:id/events/:eventId')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;