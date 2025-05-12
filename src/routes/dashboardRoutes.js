const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const isLoggedIn = require('../middleware/authMiddleware');
const checkAdmin = require("../middleware/checkAdmin");

router.get('/dashboard', isLoggedIn, checkAdmin, dashboardController.dashboard);

router.get("/profile", isLoggedIn, (req, res) => {
  if (req.user.account_type.toLowerCase() !== "employee") {
    req.flash("error_msg", "Access denied.");
    return res.redirect("/");
  }

  res.render("pages/profile", {
    title: "My Profile",
    user: req.user,
    messages: req.flash(),
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
