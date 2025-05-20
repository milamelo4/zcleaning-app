const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { showSchedule, 
    showAddAppointmentForm,
    addAppointment 
} = require("../controllers/appointments-controller");

// Route to display schedule
router.get("/schedule", isLoggedIn, showSchedule);

router.get("/add", isLoggedIn, showAddAppointmentForm);

router.post("/add", isLoggedIn, addAppointment);

module.exports = router;
