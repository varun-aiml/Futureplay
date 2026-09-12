const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
// Current active Google OAuth Client ID ("FuturePlay Web Client" - project futureplay-461207)
const CURRENT_GOOGLE_CLIENT_ID = '590767155641-ikejvmm3i0e0gft4ic38u2l86joj925e.apps.googleusercontent.com';

const getGoogleClientId = () => {
  const envId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  if (!envId || envId.includes('79973044898')) {
    return CURRENT_GOOGLE_CLIENT_ID;
  }
  return envId;
};

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const getGoogleCallbackUrl = () => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }
  return isProduction
    ? 'https://sportstek.onrender.com/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback';
};

passport.use(
  new GoogleStrategy(
    {
      clientID: getGoogleClientId(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getGoogleCallbackUrl(),
      scope: ['profile', 'email']
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }
        
        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.isEmailVerified = true; // Google accounts are pre-verified
          await user.save();
          return done(null, user);
        }
        
        // Create new user with Google data
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          isEmailVerified: true, // Google accounts are pre-verified
          profileComplete: false // Need to collect additional info
        });
        
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;