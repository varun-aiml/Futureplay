const express = require('express');
const router = express.Router();
const fixtureController = require('../controllers/fixtureController');

router.post('/save', fixtureController.saveFixtures);
router.get('/:tournamentId', fixtureController.getFixtures);
router.patch('/:fixtureId/eventMatch/:eventMatchId', fixtureController.updateEventMatch);

module.exports = router; 