const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { 
    previewMonthlySchedule,
    saveSuggestedSchedule,
    reviewSavedSchedule
} = require("../controllers/appointments-controller");

// Show preview for a given month/year
router.get("/preview-month", isLoggedIn, previewMonthlySchedule);

// Route to review the suggested schedule
router.get("/review", isLoggedIn, reviewSavedSchedule)

// Save the suggested schedule
router.post("/save-suggested", isLoggedIn, saveSuggestedSchedule);

module.exports = router;
