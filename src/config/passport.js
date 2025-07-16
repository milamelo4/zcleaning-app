const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { handleOAuthUser } = require("../controllers/users-controller.js");
const pool = require("./db");

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

passport.serializeUser((user, done) => {
  done(null, user.account_id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE account_id = $1",
      [id]
    );
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
