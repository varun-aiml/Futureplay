const mongoose = require('mongoose');

const eventMatchSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // e.g., "Open Doubles 1"
  teamAPlayers: [{ type: String, required: true }], // player names
  teamBPlayers: [{ type: String, required: true }],
  score: { type: String }, // e.g., "30-0"
  winner: { type: String }, // e.g., "teamA" or "teamB"
  scheduledTime: { type: Date }, // optional: per-event scheduling
});

const fixtureSchema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  pool: { type: String, enum: ['A', 'B', 'Knockout'], required: true },
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  scheduledTime: { type: Date },
  court: { type: Number },
  result: { type: Object }, // legacy, can be deprecated later
  round: { type: String },
  poolData: { type: Object },
  eventMatches: [eventMatchSchema], // NEW: array of event matches
});

module.exports = mongoose.model('Fixture', fixtureSchema); 