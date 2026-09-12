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

const {
  saveEventFixtures,
  getEventFixtures,
  getAllTournamentEventFixtures,
  updateEventMatch: updateEventFixtureMatch
} = require('../controllers/eventFixtureController');

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

// Persistent Event Fixtures routes
router.route('/:id/event-fixtures')
  .get(getAllTournamentEventFixtures);

router.route('/:id/events/:eventId/fixtures')
  .get(getEventFixtures)
  .post(saveEventFixtures);

router.route('/:id/events/:eventId/fixtures/matches/:matchId')
  .patch(updateEventFixtureMatch);

module.exports = router;