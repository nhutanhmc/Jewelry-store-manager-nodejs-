const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Staff = require('../model/staffModel');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://baitapdeploy-production.up.railway.app/staffsRouter/auth/google/callback'
        : 'http://localhost:3000/staffsRouter/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Staff.findOne({ googleId: profile.id });
        if (!user) {
          user = await Staff.create({
            googleId: profile.id,
            name: profile.displayName,
            role: 'cust',
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Staff.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
