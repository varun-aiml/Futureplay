const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const EventFixture = require('../models/EventFixture');
const User = require('../models/User');

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
    group: match.group || null,
    umpire: match.umpire || null,
    umpireName: match.umpireName || null,
    setScores: Array.isArray(match.setScores) ? match.setScores : [],
    nextMatchNumber: match.nextMatchNumber || null,
    nextMatchSlot: match.nextMatchSlot || null,
    completedAt: match.completedAt ? new Date(match.completedAt) : null
  };
};

// Helper to check if a match has started scoring, finished, or has official results
const hasMatchStartedOrScored = (m) => {
  if (!m) return false;
  // Check official status
  if (['In Progress', 'Completed', 'Walkover'].includes(m.status)) {
    return true;
  }
  // Check winner
  if (m.winner && typeof m.winner === 'string' && m.winner.trim() !== '') {
    return true;
  }
  // Check score
  if (m.score && typeof m.score === 'string' && m.score.trim() !== '') {
    return true;
  }
  // Check setScores
  if (Array.isArray(m.setScores) && m.setScores.length > 0) {
    const hasAnySetPoints = m.setScores.some(s => 
      (s.team1Score !== undefined && Number(s.team1Score) > 0) || 
      (s.team2Score !== undefined && Number(s.team2Score) > 0)
    );
    if (hasAnySetPoints) return true;
  }
  return false;
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

    // Protection rule: Check if an existing fixture in MongoDB has already started scoring or completed matches
    const existingFixture = await EventFixture.findOne({ tournamentId, eventId });
    if (existingFixture) {
      const existingMatches = existingFixture.matches || [];
      const existingRounds = existingFixture.rounds || [];

      const hasStartedMatches = 
        existingMatches.some(hasMatchStartedOrScored) ||
        existingRounds.some(r => (r.matchups || []).some(hasMatchStartedOrScored));

      if (hasStartedMatches) {
        return res.status(400).json({
          success: false,
          code: 'FIXTURES_LOCKED_MATCHES_STARTED',
          message: 'Fixtures cannot be regenerated because matches have already started. Existing scores and results must be preserved.'
        });
      }
    }

    let normalizedMatches = [];
    let normalizedRounds = [];

    const hasIncomingMatches = Array.isArray(fixtureData.matches) && fixtureData.matches.length > 0;
    const hasIncomingRounds = Array.isArray(fixtureData.rounds) && fixtureData.rounds.length > 0;

    // We assign shared ObjectIds so that matches in matches[] and rounds[].matchups[] share identical _ids
    const matchIdMap = new Map();

    if (hasIncomingMatches) {
      normalizedMatches = fixtureData.matches.map((m, idx) => {
        const norm = normalizeMatch(m, idx);
        if (!norm._id) {
          norm._id = new mongoose.Types.ObjectId();
        }
        matchIdMap.set(norm.matchNumber, norm._id);
        return norm;
      });
    }

    if (hasIncomingRounds) {
      let globalMatchIdx = normalizedMatches.length;

      normalizedRounds = fixtureData.rounds.map((round, rIdx) => {
        const matchups = (round.matchups || []).map((mu, mIdx) => {
          const matchNumber = mu.matchNumber || (hasIncomingMatches ? mIdx + 1 : ++globalMatchIdx);
          let assignedId = mu._id || matchIdMap.get(matchNumber);
          if (!assignedId) {
            assignedId = new mongoose.Types.ObjectId();
            matchIdMap.set(matchNumber, assignedId);
          }

          const norm = normalizeMatch(
            { ...mu, _id: assignedId, matchNumber },
            globalMatchIdx,
            round.name,
            rIdx + 1
          );
          return norm;
        });

        // If normalizedMatches wasn't provided directly (e.g. League format), aggregate ALL round matchups
        if (!hasIncomingMatches) {
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
    } else if (hasIncomingMatches) {
      // If rounds was not provided directly (e.g. Knockout format returning only matches), reconstruct rounds
      const roundNames = Array.from(new Set(normalizedMatches.map(m => m.round)));
      normalizedRounds = roundNames.map((rName, rIdx) => {
        const roundMatchups = normalizedMatches.filter(m => m.round === rName);
        return {
          name: rName,
          matches: roundMatchups.length,
          byes: 0,
          teamsInRound: roundMatchups.length * 2,
          details: `${roundMatchups.length} matches`,
          stage: '',
          groups: 0,
          matchups: roundMatchups
        };
      });
    }

    // Ensure all matches have persistent ObjectIds
    normalizedMatches.forEach((m) => {
      if (!m._id) {
        m._id = matchIdMap.get(m.matchNumber) || new mongoose.Types.ObjectId();
      }
    });

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

    const eventFixture = await EventFixture.findOne({ tournamentId, eventId });

    if (!eventFixture) {
      return res.status(200).json({
        success: true,
        data: null,
        isLocked: false,
        startedMatchesCount: 0
      });
    }

    const matches = eventFixture.matches || [];
    const startedCount = matches.filter(hasMatchStartedOrScored).length;
    const isLocked = startedCount > 0 || (eventFixture.rounds || []).some(r => (r.matchups || []).some(hasMatchStartedOrScored));

    return res.status(200).json({
      success: true,
      data: eventFixture,
      isLocked,
      startedMatchesCount: startedCount
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

// Assign or unassign an umpire to a specific match
exports.assignMatchUmpire = async (req, res) => {
  try {
    const { id: tournamentId, eventId, matchId } = req.params;
    const { umpireId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const isOwner = tournament.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this tournament' });
    }

    const eventFixture = await EventFixture.findOne({ tournamentId, eventId });
    if (!eventFixture) {
      return res.status(404).json({ success: false, message: 'Event fixture not found' });
    }

    const match = eventFixture.matches.id(matchId) ||
      eventFixture.matches.find(m => 
        (m._id && m._id.toString() === matchId.toString()) || 
        (m.matchId && m.matchId.toString() === matchId.toString()) ||
        (m.matchNumber && m.matchNumber.toString() === matchId.toString())
      );

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found in fixture' });
    }

    if (match.status === 'Completed' || match.status === 'Walkover') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reassign umpire to a completed or walkover match'
      });
    }

    let assignedUmpireName = null;
    let assignedUmpireId = null;

    if (umpireId) {
      const umpire = await User.findById(umpireId);
      if (!umpire || umpire.role !== 'umpire') {
        return res.status(400).json({ success: false, message: 'Invalid umpire selected' });
      }
      assignedUmpireId = umpire._id;
      assignedUmpireName = umpire.name;
    }

    match.umpire = assignedUmpireId;
    match.umpireName = assignedUmpireName;
    if (assignedUmpireId && match.status === 'Pending') {
      match.status = 'Scheduled';
    } else if (!assignedUmpireId && match.status === 'Scheduled') {
      match.status = 'Pending';
    }

    // Also sync to rounds matchups
    if (Array.isArray(eventFixture.rounds)) {
      for (const round of eventFixture.rounds) {
        if (Array.isArray(round.matchups)) {
          const roundMatch = round.matchups.id(match._id) ||
            round.matchups.find(m => 
              (m._id && m._id.toString() === match._id.toString()) || 
              (m.matchId && m.matchId.toString() === matchId.toString()) ||
              (m.matchNumber && m.matchNumber === match.matchNumber)
            );
          if (roundMatch) {
            roundMatch.umpire = match.umpire;
            roundMatch.umpireName = match.umpireName;
            roundMatch.status = match.status;
          }
        }
      }
    }

    await eventFixture.save();

    return res.status(200).json({
      success: true,
      message: assignedUmpireId ? `Match #${match.matchNumber || ''} assigned to umpire ${assignedUmpireName}` : `Match #${match.matchNumber || ''} unassigned`,
      data: {
        matchId: match._id,
        umpire: match.umpire,
        umpireName: match.umpireName,
        status: match.status
      }
    });
  } catch (error) {
    console.error('Error assigning umpire to match:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error assigning umpire',
      error: error.message
    });
  }
};

// Get all matches assigned to the currently logged in umpire across all tournaments
exports.getUmpireAssignedMatches = async (req, res) => {
  try {
    const umpireId = req.user._id;

    const fixtures = await EventFixture.find({
      'matches.umpire': umpireId
    }).populate('tournamentId', 'title venue city startDate endDate format matchType');

    const assignedMatches = [];

    for (const fixture of fixtures) {
      const matchingMatches = fixture.matches.filter(
        m => m.umpire && m.umpire.toString() === umpireId.toString()
      );

      for (const match of matchingMatches) {
        assignedMatches.push({
          tournamentId: fixture.tournamentId?._id || fixture.tournamentId,
          tournamentTitle: fixture.tournamentId?.title || 'Tournament',
          venue: fixture.tournamentId?.venue || '',
          city: fixture.tournamentId?.city || '',
          startDate: fixture.tournamentId?.startDate || null,
          endDate: fixture.tournamentId?.endDate || null,
          eventId: fixture.eventId,
          eventName: fixture.eventName,
          eventType: fixture.eventType,
          matchType: fixture.matchType,
          match: {
            _id: match._id,
            matchNumber: match.matchNumber,
            round: match.round,
            roundIndex: match.roundIndex,
            player1: match.player1,
            player2: match.player2,
            team1: match.team1,
            team2: match.team2,
            court: match.court,
            scheduledTime: match.scheduledTime,
            status: match.status,
            winner: match.winner,
            score: match.score,
            setScores: match.setScores,
            completedAt: match.completedAt,
            umpire: match.umpire,
            umpireName: match.umpireName
          }
        });
      }
    }

    // Sort: In Progress first, Scheduled/Pending second, Completed last
    assignedMatches.sort((a, b) => {
      const order = { 'In Progress': 0, 'Scheduled': 1, 'Pending': 2, 'Completed': 3, 'Walkover': 4 };
      return (order[a.match.status] || 2) - (order[b.match.status] || 2);
    });

    return res.status(200).json({
      success: true,
      count: assignedMatches.length,
      data: assignedMatches
    });
  } catch (error) {
    console.error('Error fetching umpire assigned matches:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching assigned matches',
      error: error.message
    });
  }
};

// Get single match details for scoring by assigned umpire or organizer
exports.getMatchForScoring = async (req, res) => {
  try {
    const { id: tournamentId, eventId, matchId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const eventFixture = await EventFixture.findOne({ tournamentId, eventId });
    if (!eventFixture) {
      return res.status(404).json({ success: false, message: 'Event fixture not found' });
    }

    const match = eventFixture.matches.id(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found in fixture' });
    }

    // Check authorization: must be tournament organizer OR assigned umpire
    const isOrganizer = tournament.organizer.toString() === req.user._id.toString();
    const isAssignedUmpire = match.umpire && match.umpire.toString() === req.user._id.toString();

    if (!isOrganizer && !isAssignedUmpire) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to score this match'
      });
    }

    const event = tournament.events.id(eventId);

    return res.status(200).json({
      success: true,
      data: {
        tournament: {
          _id: tournament._id,
          title: tournament.title,
          venue: tournament.venue,
          city: tournament.city
        },
        event: {
          _id: eventFixture.eventId,
          name: eventFixture.eventName,
          eventType: eventFixture.eventType,
          matchType: eventFixture.matchType,
          scoringFormat: event?.scoringFormat || '21-3'
        },
        match
      }
    });
  } catch (error) {
    console.error('Error fetching match for scoring:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching match details',
      error: error.message
    });
  }
};

// Submit official match result & handle knockout winner progression
exports.submitMatchScore = async (req, res) => {
  try {
    const { id: tournamentId, eventId, matchId } = req.params;
    const { score, winner, setScores, walkover } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const eventFixture = await EventFixture.findOne({ tournamentId, eventId });
    if (!eventFixture) {
      return res.status(404).json({ success: false, message: 'Event fixture not found' });
    }

    const match = eventFixture.matches.id(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found in fixture' });
    }

    // Authorization: Assigned umpire or tournament organizer
    const isOrganizer = tournament.organizer.toString() === req.user._id.toString();
    const isAssignedUmpire = match.umpire && match.umpire.toString() === req.user._id.toString();

    if (!isOrganizer && !isAssignedUmpire) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit scores for this match'
      });
    }

    // Prevent accidental duplicate submission
    if (match.status === 'Completed' || match.status === 'Walkover') {
      return res.status(400).json({
        success: false,
        message: 'This match is already completed. Duplicate submission prevented.'
      });
    }

    // Determine winner name & id
    let winnerName = winner;
    let winnerId = null;
    if (winnerName === match.player1?.name) {
      winnerId = match.player1?.id || null;
    } else if (winnerName === match.player2?.name) {
      winnerId = match.player2?.id || null;
    }

    match.score = score || '';
    match.winner = winnerName || null;
    match.status = walkover ? 'Walkover' : 'Completed';
    match.setScores = Array.isArray(setScores) ? setScores : [];
    match.completedAt = new Date();

    // Sync match update in rounds matchups
    if (Array.isArray(eventFixture.rounds)) {
      for (const round of eventFixture.rounds) {
        if (Array.isArray(round.matchups)) {
          const roundMatch = round.matchups.id(matchId);
          if (roundMatch) {
            roundMatch.score = match.score;
            roundMatch.winner = match.winner;
            roundMatch.status = match.status;
            roundMatch.setScores = match.setScores;
            roundMatch.completedAt = match.completedAt;
          }
        }
      }
    }

    // Knockout winner progression
    if (eventFixture.matchType === 'Knockout' && winnerName && winnerName !== 'TBD') {
      let targetMatch = null;
      let targetSlot = null;

      // 1. Explicit progression via nextMatchNumber
      if (match.nextMatchNumber) {
        targetMatch = eventFixture.matches.find(m => m.matchNumber === match.nextMatchNumber);
        if (targetMatch) {
          if (match.nextMatchSlot && (targetMatch[match.nextMatchSlot]?.name === 'TBD' || !targetMatch[match.nextMatchSlot]?.name)) {
            targetSlot = match.nextMatchSlot;
          } else if (targetMatch.player1?.name === 'TBD' && targetMatch.player2?.name !== 'TBD') {
            targetSlot = 'player1';
          } else if (targetMatch.player2?.name === 'TBD' && targetMatch.player1?.name !== 'TBD') {
            targetSlot = 'player2';
          } else if (targetMatch.player1?.name === 'TBD') {
            targetSlot = 'player1';
          } else if (targetMatch.player2?.name === 'TBD') {
            targetSlot = 'player2';
          }
        }
      }

      // 2. Bracket-tree fallback by round hierarchy if no nextMatchNumber
      if (!targetMatch) {
        const curRoundMatches = eventFixture.matches.filter(
          m => m.roundIndex === match.roundIndex || m.round === match.round
        );
        const mIdx = curRoundMatches.findIndex(m => m._id.toString() === match._id.toString());

        const distinctRounds = [];
        for (const m of eventFixture.matches) {
          if (!distinctRounds.some(r => r.round === m.round)) {
            distinctRounds.push({ round: m.round, roundIndex: m.roundIndex || 1 });
          }
        }
        distinctRounds.sort((a, b) => a.roundIndex - b.roundIndex);

        const curRoundIdxInList = distinctRounds.findIndex(r => r.round === match.round);
        let nextRoundMatches = [];
        if (curRoundIdxInList !== -1 && curRoundIdxInList < distinctRounds.length - 1) {
          const nextRoundName = distinctRounds[curRoundIdxInList + 1].round;
          nextRoundMatches = eventFixture.matches.filter(m => m.round === nextRoundName);
        } else {
          nextRoundMatches = eventFixture.matches.filter(m => m.roundIndex === (match.roundIndex + 1));
        }

        if (nextRoundMatches.length > 0 && mIdx !== -1) {
          const targetMatchIdx = Math.floor(mIdx / 2);
          if (targetMatchIdx < nextRoundMatches.length) {
            targetMatch = nextRoundMatches[targetMatchIdx];
            // Prioritize slot that actually has 'TBD' (e.g. when other slot is already a bye team)
            if (targetMatch.player1?.name === 'TBD' && targetMatch.player2?.name !== 'TBD') {
              targetSlot = 'player1';
            } else if (targetMatch.player2?.name === 'TBD' && targetMatch.player1?.name !== 'TBD') {
              targetSlot = 'player2';
            } else {
              targetSlot = (mIdx % 2 === 0) ? 'player1' : 'player2';
            }
          }
        }
      }

      if (targetMatch && targetSlot) {
        targetMatch[targetSlot] = {
          name: winnerName,
          id: winnerId
        };
        if (targetSlot === 'player1') targetMatch.team1 = winnerName;
        if (targetSlot === 'player2') targetMatch.team2 = winnerName;

        // Also update in rounds matchups if present
        if (Array.isArray(eventFixture.rounds)) {
          for (const r of eventFixture.rounds) {
            if (Array.isArray(r.matchups)) {
              const rm = r.matchups.id(targetMatch._id) ||
                r.matchups.find(m => m.matchNumber === targetMatch.matchNumber);
              if (rm) {
                rm[targetSlot] = targetMatch[targetSlot];
                if (targetSlot === 'player1') rm.team1 = winnerName;
                if (targetSlot === 'player2') rm.team2 = winnerName;
              }
            }
          }
        }
      }
    }

    // Update overall EventFixture status
    if (eventFixture.matchType === 'League') {
      const allCompleted = eventFixture.matches.every(m => m.status === 'Completed' || m.status === 'Walkover');
      eventFixture.status = allCompleted ? 'Completed' : 'In Progress';
    } else if (eventFixture.matchType === 'Knockout') {
      const finalMatch = eventFixture.matches.find(m => m.round === 'FINAL' || m.roundIndex === eventFixture.totalRounds);
      if (finalMatch && (finalMatch.status === 'Completed' || finalMatch.status === 'Walkover')) {
        eventFixture.status = 'Completed';
      } else {
        eventFixture.status = 'In Progress';
      }
    } else if (eventFixture.matchType === 'Group+Knockout') {
      const allCompleted = eventFixture.matches.every(m => m.status === 'Completed' || m.status === 'Walkover');
      eventFixture.status = allCompleted ? 'Completed' : 'In Progress';
    }

    eventFixture.markModified('matches');
    eventFixture.markModified('rounds');
    await eventFixture.save();

    return res.status(200).json({
      success: true,
      message: 'Official match score submitted successfully',
      data: {
        match,
        eventFixture
      }
    });
  } catch (error) {
    console.error('Error submitting match score:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting match score',
      error: error.message
    });
  }
};
