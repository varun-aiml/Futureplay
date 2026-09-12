const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

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
const fixtureRoutes = require('./routes/fixtureRoutes');


// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings matching Express
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5173', 
        'https://sportstek-frontend.onrender.com'
      ];

      const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);

      if (isLocalNetwork || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

// Attach io to Express app so controllers can access it via req.app.get('io')
app.set('io', io);

// Socket.IO room management for tournament live scoring
io.on('connection', (socket) => {
  socket.on('join:tournament', (tournamentId) => {
    if (tournamentId) {
      socket.join(`tournament_${tournamentId}`);
    }
  });

  socket.on('leave:tournament', (tournamentId) => {
    if (tournamentId) {
      socket.leave(`tournament_${tournamentId}`);
    }
  });
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173', 
      'https://sportstek-frontend.onrender.com'
    ];

    // Allow local network origins (e.g., 192.168.1.37:5173) for mobile testing
    const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (isLocalNetwork || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
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
app.use('/api/fixtures', fixtureRoutes);

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
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} (0.0.0.0)`));
