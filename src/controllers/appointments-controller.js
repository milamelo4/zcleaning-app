const { getUpcomingAppointments } = require("../models/appointments-model");
const {
  getServiceTypes,
  getFilteredClients,
} = require("../models/clients-model");
const { createAppointment } = require("../models/appointments-model");

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

async function showAddAppointmentForm(req, res) {
  try {
    const clients = await getFilteredClients();
    const serviceTypes = await getServiceTypes();

    res.render("pages/appointments/add-appointment", {
      title: "Add Appointment",
      clients,
      serviceTypes,
      user: req.user,
      errors: [],
      oldData: {},
    });
  } catch (err) {
    console.error("Failed to load appointment form:", err);
    req.flash("error_msg", "Failed to load form.");
    res.redirect("/appointments/schedule");
  }
}

async function addAppointment(req, res) {
  try {
    const {
      client_id,
      appointment_date,
      service_type_id,
      duration_hours,
      price,
      notes,
    } = req.body;

    const appointmentData = {
      client_id,
      appointment_date,
      service_type_id,
      duration_hours: duration_hours || null,
      price: price || null,
      notes: notes || null,
    };

    await createAppointment(appointmentData);

    req.flash("success_msg", "Appointment created successfully.");
    res.redirect("/appointments/schedule");
  } catch (err) {
    console.error("Error creating appointment:", err);
    req.flash("error_msg", "Failed to create appointment.");
    res.redirect("/appointments/add");
  }
}

module.exports = { 
  showSchedule, 
  showAddAppointmentForm, 
  addAppointment
};