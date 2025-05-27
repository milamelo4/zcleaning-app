const { getServiceTypes, getFilteredClients,} = require("../models/clients-model");
const { 
  createAppointment, 
  getSchedulableClients, 
  getUpcomingAppointments 
} = require("../models/appointments-model");

const { getClientsForWeek, getClientsForMonth } = require("../utils/scheduleHelpers");

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

async function previewWeeklySchedule(req, res) {
  try {
    const { start } = req.query;
    const weekStartDate = start ? new Date(start) : new Date(); // fallback to today

    const clients = await getSchedulableClients();
    const suggested = getClientsForWeek(clients, weekStartDate);

    res.render("pages/appointments/weekly-preview", {
      title: "Suggested Weekly Schedule",
      appointments: suggested,
      weekStartDate: weekStartDate.toISOString().slice(0, 10),
      user: req.user,
    });
  } catch (err) {
    console.error("Error loading weekly schedule preview:", err);
    req.flash("error_msg", "Could not generate weekly schedule.");
    res.redirect("/dashboard");
  }
}

async function previewMonthlySchedule(req, res) {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();

    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth(); // 0-based

    const clients = await getSchedulableClients();
    const { scheduledClients, unassignedClients } = getClientsForMonth(
      clients,
      targetYear,
      targetMonth
    );


    res.render("pages/appointments/monthly-preview", {
      title: "Suggested Monthly Schedule",
      appointments: scheduledClients,
      unassignedClients,
      year: targetYear,
      month: targetMonth,
      user: req.user,
    });
    
  } catch (err) {
    console.error("Error loading monthly schedule preview:", err);
    req.flash("error_msg", "Could not generate monthly schedule.");
    res.redirect("/dashboard");
  }
}
module.exports = { 
  showSchedule, 
  showAddAppointmentForm, 
  addAppointment,
  previewWeeklySchedule,
  previewMonthlySchedule,
};