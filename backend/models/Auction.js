const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  tournamentName: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  numberOfPoints: {
    type: Number,
    required: [true, 'Number of points is required'],
    min: [1, 'Number of points must be at least 1']
  },
  playersPerTeam: {
    type: Number,
    required: [true, 'Number of players per team is required'],
    min: [1, 'Number of players per team must be at least 1']
  },
  auctionTime: {
    type: String,
    required: [true, 'Auction time is required']
  },
  auctionDate: {
    type: Date,
    required: [true, 'Auction date is required']
  },
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

const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = Auction;