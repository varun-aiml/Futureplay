const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true
    },
    // Remove startDate and endDate fields
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: [2, 'Minimum 2 participants required']
    },
    entryFee: {
      type: Number,
      required: [true, 'Entry fee is required'],
      min: [0, 'Entry fee cannot be negative']
    },
    // Add new fields
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Singles', 'Doubles', 'Team']
    },
    matchType: {
      type: String,
      required: [true, 'Match type is required'],
      enum: ['Knockout', 'League', 'Group+Knockout']
    },
    allowBooking: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    fixtures: [{
      eventId: mongoose.Schema.Types.ObjectId,
      matchType: String,
      status: {
        type: String,
        enum: ['Generated', 'Modified', 'Insufficient Participants'],
        default: 'Generated'
      },
      pools: {
        A: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Franchise'
        }],
        B: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Franchise'
        }]
      },
      matches: [{
        round: Number,
        matchNumber: Number,
        team1: String,
        team2: String,
        winner: String,
        score: String
      }],
      groups: [{
        name: String,
        teams: [String],
        matches: [{
          team1: String,
          team2: String,
          winner: String,
          score: String
        }]
      }]
    }]
  });

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  posterUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Completed'],
    default: 'Upcoming'
  },
  events: [eventSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to update status based on dates
tournamentSchema.pre('save', function(next) {
  const now = new Date();
  if (now >= this.startDate && now <= this.endDate) {
    this.status = 'Active';
  } else if (now > this.endDate) {
    this.status = 'Completed';
  } else {
    this.status = 'Upcoming';
  }
  next();
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;