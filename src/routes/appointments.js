const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const {
  previewMonthlySchedule,
  saveFinalizedSchedule,
  viewSavedAppointments,
  saveScheduleDraft,
  clearScheduleDraft,
} = require("../controllers/appointments-controller");

// Show preview for a given month/year
router.get("/monthly-preview", isLoggedIn, previewMonthlySchedule);

// Route to review the suggested schedule
router.get("/review", isLoggedIn, viewSavedAppointments)

// Save the suggested schedule
router.post("/save-suggested", isLoggedIn, saveFinalizedSchedule);

// Save the draft schedule
router.post("/save-draft", isLoggedIn, saveScheduleDraft);

// Clear the draft schedule
router.post("/clear-draft", isLoggedIn, clearScheduleDraft);

module.exports = router;
