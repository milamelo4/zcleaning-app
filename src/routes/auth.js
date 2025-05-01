const express = require("express");
const router = express.Router();
const passport = require("passport");

// Initialize Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle OAuth callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    req.flash("success_msg", "You are now logged in!");
    res.redirect("/dashboard"); // or wherever you want to go
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success_msg", "You have been logged out.");
    res.redirect("/"); // Redirect *before* destroying the session
  });
});

module.exports = router;
