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
  uploadTournamentPoster
} = require('../controllers/tournamentController');

// All routes are protected and require authentication
router.use(protect);

// Tournament routes
router.route('/organizer')
  .get(getOrganizerTournaments);

router.route('/')
  .post(uploadTournamentPoster, createTournament);

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