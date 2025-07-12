const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reverseGeocodeRoute = require('./routes/reverseGeoCode');
const franchiseRoutes = require('./routes/franchiseRoutes');
const auctionRoutes = require('./routes/auctionRoutes');


// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://sportstek-frontend.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/bookings', bookingRoutes); 
app.use('/api/reverse-geocode', reverseGeocodeRoute);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/auctions', auctionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
