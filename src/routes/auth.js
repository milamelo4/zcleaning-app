const express = require("express");
const router = express.Router();
const passport = require("passport");

// Initialize Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle OAuth callback
router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err || !user) {
      req.flash("error_msg", "Access denied. Your account is not authorized.");
      return res.redirect("/");
    }

    req.logIn(user, (err) => {
      if (err) {
        req.flash("error_msg", "Login failed.");
        return res.redirect("/");
      }

      const role = user.account_type.toLowerCase();

      if (role === "unauthorized") {
        return res.redirect("/request-pending");
      }

      if (role === "employee") {
        return res.redirect("/profile"); 
      }

      req.flash("success_msg", "You are now logged in!");
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

router.get("/request-pending", (req, res) => {
  res.render("pages/request-pending", { 
    title: "Request Pending", 
    messages: req.flash() });
});


router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success_msg", "You have been logged out.");
    res.redirect("/"); // Redirect *before* destroying the session
  });
});

module.exports = router;
