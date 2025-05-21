const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { 
    showSchedule, 
    showAddAppointmentForm,
    addAppointment,
    previewWeeklySchedule
} = require("../controllers/appointments-controller");

// Route to display schedule
router.get("/schedule", isLoggedIn, showSchedule);

router.get("/add", isLoggedIn, showAddAppointmentForm);

router.post("/add", isLoggedIn, addAppointment);

// Show preview for a given month/year
router.get("/preview-week", isLoggedIn, previewWeeklySchedule);

module.exports = router;
