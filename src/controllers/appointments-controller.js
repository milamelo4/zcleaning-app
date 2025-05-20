const { getUpcomingAppointments } = require("../models/appointments-model");

async function showSchedule(req, res) {
  try {
    const appointments = await getUpcomingAppointments();

    res.render("pages/appointments/schedule", {
      title: "Upcoming Appointments",
      appointments,
      user: req.user,
    });
  } catch (err) {
    console.error("Error loading schedule:", err);
    req.flash("error_msg", "Could not load schedule.");
    res.redirect("/dashboard");
  }
}

module.exports = { showSchedule };