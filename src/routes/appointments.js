const express = require("express");
const router = express.Router();
const { showSchedule } = require("../controllers/appointments-controller");

// Route to display schedule
router.get("/schedule", showSchedule);

module.exports = router;
