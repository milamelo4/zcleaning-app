const express = require('express');
const router = express.Router();
const { dashboard, profile} = require('../controllers/dashboardController');
const isLoggedIn = require('../middleware/authMiddleware');
const checkAdmin = require("../middleware/checkAdmin");

router.get('/dashboard', isLoggedIn, checkAdmin, dashboard);

router.get("/profile", isLoggedIn, profile);

router.get("/about", (req, res) => {
  res.render("pages/about", { 
    title: "About ZCleaning",
    user: req.user,
  });
});

module.exports = router;
