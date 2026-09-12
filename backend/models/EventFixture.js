const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  round: {
    type: String,
    required: true,
    trim: true
  },
  roundIndex: {
    type: Number,
    default: 1
  },
  matchNumber: {
    type: Number,
    required: true
  },
  player1: {
    name: { type: String, default: 'TBD' },
    id: { type: String, default: null }
  },
  player2: {
    name: { type: String, default: 'TBD' },
    id: { type: String, default: null }
  },
  team1: {
    type: String,
    default: ''
  },
  team2: {
    type: String,
    default: ''
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  court: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Walkover'],
    default: 'Pending'
  },
  winner: {
    type: String,
    default: null
  },
  score: {
    type: String,
    default: ''
  },
  group: {
    type: String,
    default: null
  },
  umpire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  umpireName: {
    type: String,
    default: null
  },
  setScores: [{
    setNumber: { type: Number },
    team1Score: { type: Number, default: 0 },
    team2Score: { type: Number, default: 0 }
  }],
  nextMatchNumber: {
    type: Number,
    default: null
  },
  nextMatchSlot: {
    type: String,
    enum: ['player1', 'player2', null],
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const roundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  matches: { type: Number, default: 0 },
  byes: { type: Number, default: 0 },
  teamsInRound: { type: Number, default: 0 },
  details: { type: String, default: '' },
  stage: { type: String, default: '' },
  groups: { type: Number, default: 0 },
  matchups: [matchSchema]
}, { _id: true });

const groupScheduleSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  matches: [matchSchema]
}, { _id: true });

const groupFixtureSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  teams: [{ type: String }],
  schedule: [groupScheduleSchema]
}, { _id: true });

const eventFixtureSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Tournament ID is required'],
    index: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Event ID is required'],
    index: true
  },
  eventName: {
    type: String,
    trim: true,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['Singles', 'Doubles', 'Team'],
    required: [true, 'Event type is required']
  },
  matchType: {
    type: String,
    enum: ['Knockout', 'League', 'Group+Knockout'],
    required: [true, 'Match type is required']
  },
  numTeams: {
    type: Number,
    default: 0
  },
  totalRounds: {
    type: Number,
    default: 0
  },
  totalMatches: {
    type: Number,
    default: 0
  },
  summary: {
    type: String,
    default: ''
  },
  matches: [matchSchema],
  rounds: [roundSchema],
  groupFixtures: [groupFixtureSchema],
  pointsSystem: {
    win: { type: Number, default: 3 },
    draw: { type: Number, default: 1 },
    loss: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Generated', 'Modified', 'In Progress', 'Completed'],
    default: 'Generated'
  }
}, {
  timestamps: true
});

// Composite unique index: One fixture record per event per tournament
eventFixtureSchema.index({ tournamentId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('EventFixture', eventFixtureSchema);
