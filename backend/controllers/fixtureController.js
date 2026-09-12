const Fixture = require('../models/Fixture');

// Save fixtures (bulk insert)
exports.saveFixtures = async (req, res) => {
  try {
    const { tournamentId, fixtures } = req.body;
    await Fixture.deleteMany({ tournamentId });
    // Ensure eventMatches is populated from result for each fixture
    const fixturesWithTournament = fixtures.map(f => {
      let eventMatches = f.eventMatches || [];
      // If result is present and eventMatches is empty, use result
      if ((!eventMatches || eventMatches.length === 0) && Array.isArray(f.result) && f.result.length > 0) {
        eventMatches = f.result.map(em => {
          // Ensure each event match has an eventId (fallback to eventType or eventName)
          return {
            eventId: em.eventId || em.eventType || em.eventName || '',
            eventType: em.eventType || em.eventName || '',
            teamAPlayers: em.teamAPlayers || [],
            teamBPlayers: em.teamBPlayers || [],
            score: em.score || '',
            winner: em.winner || '',
            scheduledTime: em.scheduledTime || null,
          };
        });
      }
      return { ...f, tournamentId, eventMatches };
    });
    const saved = await Fixture.insertMany(fixturesWithTournament);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get fixtures for a tournament
exports.getFixtures = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const fixtures = await Fixture.find({ tournamentId });
    res.json(fixtures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a specific event match within a fixture
exports.updateEventMatch = async (req, res) => {
  try {
    const { fixtureId, eventMatchId } = req.params;
    const { teamAPlayers, teamBPlayers, score, winner, scheduledTime } = req.body;

    console.log('PATCH eventMatch', { fixtureId, eventMatchId });
    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      console.error('Fixture not found', { fixtureId });
      return res.status(404).json({ error: 'Fixture not found' });
    }
    console.log('Fixture eventMatches:', fixture.eventMatches);

    // Find the event match by _id
    const eventMatch = fixture.eventMatches.find(em => em._id.toString() === eventMatchId);
    console.log('Found eventMatch:', eventMatch);
    if (!eventMatch) {
      console.error(`Event match not found for eventMatchId: ${eventMatchId}`);
      return res.status(404).json({ error: 'Event match not found' });
    }

    // Update fields if provided (allow empty arrays)
    if (teamAPlayers !== undefined) eventMatch.teamAPlayers = teamAPlayers;
    if (teamBPlayers !== undefined) eventMatch.teamBPlayers = teamBPlayers;
    if (score !== undefined) eventMatch.score = score;
    if (winner !== undefined) eventMatch.winner = winner;
    if (scheduledTime !== undefined) eventMatch.scheduledTime = scheduledTime;

    await fixture.save();
    res.json(fixture);
  } catch (err) {
    console.error('Error in updateEventMatch:', err.message, err.stack);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}; 