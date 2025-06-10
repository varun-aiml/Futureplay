const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  playerName: {
    type: String,
    required: [true, 'Please provide player name']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  registrationSource: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);