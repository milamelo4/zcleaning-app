const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const isLoggedIn = require('../middleware/authMiddleware');
const checkAdmin = require("../middleware/checkAdmin");

router.get('/dashboard', isLoggedIn, checkAdmin, dashboardController.dashboard);

router.get("/profile", isLoggedIn, (req, res) => {
  const type = req.user.account_type.toLowerCase();
  const allowed = ["admin", "supervisor", "employee"];

  if (!allowed.includes(type)) {
    req.flash("error_msg", "Access denied.");
    return res.redirect("/");
  }

  // Proceed to render profile
  res.render("pages/profile", {
    title: "Your Profile",
    user: req.user,
  });
});

router.get("/about", (req, res) => {
  res.render("pages/about", { 
    title: "About ZCleaning",
    messages: req.flash(),
    user: req.user,
  });
});

module.exports = router;
