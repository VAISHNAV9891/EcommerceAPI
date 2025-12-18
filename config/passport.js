import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import User from '../models/userSchema.js'
import 'dotenv/config'//Load the environment variables

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/users/google/callback" 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      } else {
        
        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });
        return done(null, newUser);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));