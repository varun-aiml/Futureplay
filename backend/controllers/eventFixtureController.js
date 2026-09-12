const Tournament = require('../models/Tournament');
const EventFixture = require('../models/EventFixture');

// Helper to normalize a match object
const normalizeMatch = (match, index, defaultRound = 'ROUND 1', defaultRoundIndex = 1) => {
  const p1Name = match.player1?.name || match.team1 || 'TBD';
  const p1Id = match.player1?.id || match.player1?._id || null;
  const p2Name = match.player2?.name || match.team2 || (match.player2 ? 'BYE' : 'TBD');
  const p2Id = match.player2?.id || match.player2?._id || null;

  return {
    _id: match._id || undefined,
    round: match.round || defaultRound,
    roundIndex: match.roundIndex || defaultRoundIndex,
    matchNumber: match.matchNumber || (index + 1),
    player1: { name: p1Name, id: p1Id ? p1Id.toString() : null },
    player2: { name: p2Name, id: p2Id ? p2Id.toString() : null },
    team1: p1Name,
    team2: p2Name,
    scheduledTime: match.scheduledTime ? new Date(match.scheduledTime) : null,
    court: match.court ? match.court.toString() : null,
    status: match.status || 'Pending',
    winner: match.winner || null,
    score: match.score || '',
    group: match.group || null
  };
};

// Save or update event fixtures for a specific tournament event
exports.saveEventFixtures = async (req, res) => {
  try {
    const { id: tournamentId, eventId } = req.params;
    const { fixtureData } = req.body;

    if (!fixtureData) {
      return res.status(400).json({ success: false, message: 'Missing fixtureData in request body' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Authorization check
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this tournament' });
    }

    const event = tournament.events.id(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found in this tournament' });
    }

    let normalizedMatches = [];
    let normalizedRounds = [];

    if (Array.isArray(fixtureData.matches) && fixtureData.matches.length > 0) {
      normalizedMatches = fixtureData.matches.map((m, idx) => normalizeMatch(m, idx));
    }

    if (Array.isArray(fixtureData.rounds) && fixtureData.rounds.length > 0) {
      let globalMatchIdx = normalizedMatches.length;

      normalizedRounds = fixtureData.rounds.map((round, rIdx) => {
        const matchups = (round.matchups || []).map((mu, mIdx) => {
          const norm = normalizeMatch(mu, globalMatchIdx++, round.name, rIdx + 1);
          return norm;
        });

        // If normalizedMatches wasn't provided directly (e.g. League format), aggregate from round matchups
        if (normalizedMatches.length === 0) {
          normalizedMatches.push(...matchups);
        }

        return {
          name: round.name,
          matches: round.matches || matchups.length,
          byes: round.byes || 0,
          teamsInRound: round.teamsInRound || 0,
          details: round.details || '',
          stage: round.stage || '',
          groups: round.groups || 0,
          matchups
        };
      });
    }

    const eventFixture = await EventFixture.findOneAndUpdate(
      { tournamentId, eventId },
      {
        tournamentId,
        eventId,
        eventName: event.name || fixtureData.eventName || '',
        eventType: event.eventType || fixtureData.eventType || 'Singles',
        matchType: event.matchType || fixtureData.matchType || 'Knockout',
        numTeams: fixtureData.numTeams || 0,
        totalRounds: fixtureData.totalRounds || (normalizedRounds.length > 0 ? normalizedRounds.length : 1),
        totalMatches: fixtureData.totalMatches || normalizedMatches.length,
        summary: fixtureData.summary || '',
        matches: normalizedMatches,
        rounds: normalizedRounds,
        groupFixtures: fixtureData.groupFixtures || [],
        pointsSystem: fixtureData.pointsSystem || { win: 3, draw: 1, loss: 0 },
        status: fixtureData.status || 'Generated'
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Event fixtures saved successfully',
      data: eventFixture
    });
  } catch (error) {
    console.error('Error saving event fixtures:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving event fixtures',
      error: error.message
    });
  }
};

// Get fixtures for a single tournament event
exports.getEventFixtures = async (req, res) => {
  try {
    const { id: tournamentId, eventId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view fixtures for this tournament' });
    }

    const eventFixture = await EventFixture.findOne({ tournamentId, eventId });

    return res.status(200).json({
      success: true,
      data: eventFixture || null
    });
  } catch (error) {
    console.error('Error fetching event fixtures:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching event fixtures',
      error: error.message
    });
  }
};

// Get all event fixtures for a tournament
exports.getAllTournamentEventFixtures = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view fixtures for this tournament' });
    }

    const fixtures = await EventFixture.find({ tournamentId });

    return res.status(200).json({
      success: true,
      count: fixtures.length,
      data: fixtures
    });
  } catch (error) {
    console.error('Error fetching tournament event fixtures:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching tournament event fixtures',
      error: error.message
    });
  }
};

// Update an individual match within an event fixture
exports.updateEventMatch = async (req, res) => {
  try {
    const { id: tournamentId, eventId, matchId } = req.params;
    const updateData = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this tournament' });
    }

    const eventFixture = await EventFixture.findOne({ tournamentId, eventId });
    if (!eventFixture) {
      return res.status(404).json({ success: false, message: 'Event fixture not found' });
    }

    let matchUpdated = false;

    // 1. Update in flat matches array
    const match = eventFixture.matches.id(matchId);
    if (match) {
      if (updateData.player1 !== undefined) {
        match.player1 = {
          name: updateData.player1.name || match.player1?.name || 'TBD',
          id: updateData.player1.id || match.player1?.id || null
        };
        match.team1 = match.player1.name;
      }
      if (updateData.player2 !== undefined) {
        match.player2 = {
          name: updateData.player2.name || match.player2?.name || 'TBD',
          id: updateData.player2.id || match.player2?.id || null
        };
        match.team2 = match.player2.name;
      }
      if (updateData.scheduledTime !== undefined) {
        match.scheduledTime = updateData.scheduledTime ? new Date(updateData.scheduledTime) : null;
      }
      if (updateData.court !== undefined) match.court = updateData.court;
      if (updateData.status !== undefined) match.status = updateData.status;
      if (updateData.winner !== undefined) match.winner = updateData.winner;
      if (updateData.score !== undefined) match.score = updateData.score;
      matchUpdated = true;
    }

    // 2. Also sync to rounds matchups if present
    if (Array.isArray(eventFixture.rounds)) {
      for (const round of eventFixture.rounds) {
        if (Array.isArray(round.matchups)) {
          const roundMatch = round.matchups.id(matchId);
          if (roundMatch) {
            if (updateData.player1 !== undefined) {
              roundMatch.player1 = match ? match.player1 : updateData.player1;
              roundMatch.team1 = updateData.player1.name || roundMatch.team1;
            }
            if (updateData.player2 !== undefined) {
              roundMatch.player2 = match ? match.player2 : updateData.player2;
              roundMatch.team2 = updateData.player2.name || roundMatch.team2;
            }
            if (updateData.scheduledTime !== undefined) roundMatch.scheduledTime = match ? match.scheduledTime : updateData.scheduledTime;
            if (updateData.court !== undefined) roundMatch.court = updateData.court;
            if (updateData.status !== undefined) roundMatch.status = updateData.status;
            if (updateData.winner !== undefined) roundMatch.winner = updateData.winner;
            if (updateData.score !== undefined) roundMatch.score = updateData.score;
            matchUpdated = true;
          }
        }
      }
    }

    if (!matchUpdated) {
      return res.status(404).json({ success: false, message: 'Match not found in fixture' });
    }

    eventFixture.status = 'Modified';
    await eventFixture.save();

    return res.status(200).json({
      success: true,
      message: 'Match updated successfully',
      data: eventFixture
    });
  } catch (error) {
    console.error('Error updating event match:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating event match',
      error: error.message
    });
  }
};
