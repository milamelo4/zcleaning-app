const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { handleOAuthUser } = require("../controllers/users-controller.js");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      //console.log(profile)
      (async () => {
        try {
          const firstName = profile.name.givenName;
          const lastName = profile.name.familyName;
          const email = profile.emails[0].value;
          const profileImage = profile._json.picture || null;
          const user = await handleOAuthUser(
            firstName,
            lastName,
            email,
            profileImage
          );

          return done(null, user);
        } catch (err) {
          console.error("Error in handleOAuthUser:", err);
          return done(err, null);
        }
      })();
    }
  )
);

// Save user info to session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
