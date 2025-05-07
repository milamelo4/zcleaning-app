const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const isLoggedIn = require('../middleware/authMiddleware');
const checkAdmin = require("../middleware/checkAdmin");

router.get('/dashboard', isLoggedIn, checkAdmin, dashboardController.dashboard);

module.exports = router;
