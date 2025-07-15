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
const isAdmin = require("../middleware/checkAdmin");

// Show preview of monthly schedule
router.get("/monthly-preview", isLoggedIn, isAdmin, previewMonthlySchedule);

// Route to review the suggested schedule
router.get("/review", isLoggedIn, isAdmin, viewSavedAppointments)

// Save the suggested schedule to the database
router.post("/save-suggested", isLoggedIn, isAdmin, saveFinalizedSchedule);

// Save the draft schedule
router.post("/save-draft", isLoggedIn, isAdmin, saveScheduleDraft);

// Clear the draft schedule
router.post("/clear-draft", isLoggedIn, isAdmin, clearScheduleDraft);

// Delete an appointment by ID
router.post("/:id/delete", isLoggedIn, isAdmin, deleteAppointment);

// Edit an appointment by ID
router.post( "/:id/update", isLoggedIn, isAdmin, updateAppointment);

module.exports = router;
