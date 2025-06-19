const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const {
  previewMonthlySchedule,
  saveFinalizedSchedule,
  viewSavedAppointments,
  saveScheduleDraft,
  clearScheduleDraft,
  deleteAppointment,
  updateAppointment,
} = require("../controllers/appointments-controller");

// Show preview of monthly schedule
router.get("/monthly-preview", isLoggedIn, previewMonthlySchedule);

// Route to review the suggested schedule
router.get("/review", isLoggedIn, viewSavedAppointments)

// Save the suggested schedule to the database
router.post("/save-suggested", isLoggedIn, saveFinalizedSchedule);

// Save the draft schedule
router.post("/save-draft", isLoggedIn, saveScheduleDraft);

// Clear the draft schedule
router.post("/clear-draft", isLoggedIn, clearScheduleDraft);

// Delete an appointment by ID
router.post("/:id/delete", isLoggedIn, deleteAppointment);

// Edit an appointment by ID
router.post( "/:id/update", isLoggedIn, updateAppointment);

module.exports = router;
