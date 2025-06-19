const fs = require("fs");
const path = require("path");
const {
  createAppointment,
  getSchedulableClients,
  deleteAppointmentById,
  updateAppointmentDetails,
  getAppointmentsByDate,
  getAppointmentsByRange,
} = require("../models/appointments-model");

const { getClientsForMonth } = require("../utils/scheduleHelpers");
const { generateWhatsappSchedule } = require("../utils/formatWhatsappMessage");
const { insertPaymentIfNeeded } = require("../models/clients-model"); 

async function previewMonthlySchedule(req, res) {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth(); // 0-based

    let scheduledClients = [];
    let unassignedClients = [];

    const draftPath = path.join(__dirname, "..", "..", "drafts", "schedule-draft.json");

    if (fs.existsSync(draftPath)) {
      const draftData = fs.readFileSync(draftPath, "utf8");
      const parsed = JSON.parse(draftData);
      scheduledClients = parsed.scheduledClients || [];
      unassignedClients = parsed.unassignedClients || [];

      // req.session.scheduleDraft = scheduledClients;
      // req.session.unassignedClients = unassignedClients;
    } else {
      const clients = await getSchedulableClients();
      const generated = getClientsForMonth(clients, targetYear, targetMonth);
      scheduledClients = generated.scheduledClients;
      unassignedClients = generated.unassignedClients;

      // req.session.scheduleDraft = scheduledClients;
      // req.session.unassignedClients = unassignedClients;
    }

    res.render("pages/appointments/monthly-preview", {
      title: "Suggested Monthly Schedule",
      appointments: scheduledClients,
      unassignedClients,
      year: targetYear,
      month: targetMonth,
      user: req.user,
      appointmentsJson: JSON.stringify(scheduledClients),
    });
  } catch (err) {
    console.error("Error loading monthly schedule preview:", err);
    req.flash("error_msg", "Could not generate monthly schedule.");
    res.redirect("/dashboard");
  }
}

async function saveFinalizedSchedule(req, res) {
  try {
    const raw = req.body.appointments;

    let appointments = [];
    try {
      appointments = JSON.parse(raw);

      if (typeof appointments === "string") {
        appointments = JSON.parse(appointments);
      }

      if (!Array.isArray(appointments)) {
        appointments = [appointments];
      }

      appointments = appointments.flat();
    } catch (err) {
      console.error("Failed to parse JSON:", err.message);
      req.flash("error_msg", "Invalid appointment data.");
      return res.redirect("/appointments/monthly-preview");
    }

    // Step 1: Get the full date range from the draft
    const allDates = appointments.map(
      (appt) => new Date(appt.appointment_date)
    );
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    const startDate = minDate.toISOString().split("T")[0];
    const endDate = maxDate.toISOString().split("T")[0];

    // Step 2: Get existing appointments in that date range
    const existingAppointments = await getAppointmentsByRange(
      startDate,
      endDate
    );

    // Step 3: Create a map for quick lookup
    const existingMap = {};
    for (const appt of existingAppointments) {
      const formattedDate = new Date(appt.appointment_date)
        .toISOString()
        .split("T")[0];
      const key = `${appt.client_id}|${formattedDate}`;
      existingMap[key] = appt;
    }    

    // Step 4: Handle inserts and updates
    for (const appt of appointments) {
      const client_id = parseInt(appt.client_id);
      const service_type_id = parseInt(appt.service_type_id);
      const duration_hours = parseFloat(appt.duration_hours);
      const price = appt.price !== undefined ? parseFloat(appt.price) : 0;
      const notes = appt.notes || null;
      const appointment_date = appt.appointment_date;

      if (
        isNaN(client_id) ||
        isNaN(service_type_id) ||
        isNaN(duration_hours) ||
        isNaN(price) ||
        !appointment_date
      ) {
        continue; // Skip invalid data
      }

      const key = `${client_id}|${new Date(appointment_date).toISOString().split("T")[0]
      }`;

      const existing = existingMap[key];

      if (existing) {
        // Update if values changed
        const hasChanges =
          existing.service_type_id !== service_type_id ||
          parseFloat(existing.duration_hours) !== duration_hours ||
          parseFloat(existing.price) !== price ||
          (existing.notes || "") !== notes;

        if (hasChanges) {
          await updateAppointmentDetails(existing.appointment_id, price, notes);
        }

        // Remove handled item from map
        delete existingMap[key];
      } else {
        // New appointment
        await createAppointment({
          client_id,
          appointment_date,
          service_type_id,
          duration_hours,
          price,
          notes,
        });
      }

      // Always attempt to create payment
      await insertPaymentIfNeeded(client_id, appointment_date);
    }

    // Step 5: Delete appointments that are no longer in the draft
    for (const leftoverKey in existingMap) {
      const appt = existingMap[leftoverKey];

      if (appt && appt.appointment_id) {
        try {
          await deleteAppointmentById(appt.appointment_id);
        } catch (err) {
          console.error(
            "Failed to delete appointment:",
            appt.appointment_id,
            err.message
          );
        }
      }
    }
    

    req.flash("success_msg", "Schedule saved successfully.");
    res.redirect("/appointments/review");
  } catch (err) {
    console.error("Error saving suggested schedule:", err);
    req.flash("error_msg", "Failed to save schedule.");
    res.redirect("/appointments/monthly-preview");
  }
}


async function viewSavedAppointments(req, res) {
  try {
    const { date } = req.query;
    let appointments = [];

    if (date) {
      // Specific day filter
      appointments = await getAppointmentsByDate(date);
    } else {
      // Default to current month
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      appointments = await getAppointmentsByRange(firstDay, lastDay);
    }

    if ((!appointments || appointments.length === 0) && date) {
      req.flash("error_msg", "No appointments found for selected date.");
    }
    

    appointments.sort(
      (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)
    );
    const whatsappMessage = generateWhatsappSchedule(appointments);   

    res.render("pages/appointments/review", {
      title: "Manage Appointments",
      appointments,
      appointmentsJson: JSON.stringify(appointments),
      whatsappMessage,
      user: req.user,
      selectedDate: date || "", 
    });
  } catch (err) {
    console.error("Failed to load appointments:", err);
    req.flash("error_msg", "Failed to load appointments.");
    res.redirect("/appointments/review");
  }
}

function saveScheduleDraft(req, res) {
  let appointments = [];

  try {
    appointments = JSON.parse(req.body.appointments);
  } catch (err) {
    console.error("Invalid appointments data:", err);
    return res.send("Invalid appointments data.");
  }

  const scheduled = appointments.filter((c) => c.appointment_date !== null);
  const unassigned = appointments.filter((c) => c.appointment_date === null);

  const draftData = {
    scheduledClients: scheduled,
    unassignedClients: unassigned,
  };

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "drafts",
    "schedule-draft.json"
  );

  fs.writeFile(filePath, JSON.stringify(draftData, null, 2), (err) => {
    if (err) {
      console.error("Failed to save schedule draft:", err);
      return res.send("Failed to save draft.");
    }

    req.flash("success_msg", "Draft saved successfully.");
    res.redirect("/appointments/monthly-preview");
  });
}

function clearScheduleDraft(req, res) {
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "drafts",
    "schedule-draft.json"
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Delete the draft
  }

  req.flash("success_msg", "Draft cleared. A new schedule will be generated.");
  res.redirect("/appointments/monthly-preview");
}

async function deleteAppointment(req, res) {
  try {
    const apptId = parseInt(req.params.id);
    if (isNaN(apptId)) {
      req.flash("error_msg", "Invalid appointment ID.");
      return res.redirect("/appointments/review");
    }

    await deleteAppointmentById(apptId);
    req.flash("success_msg", "Appointment deleted successfully.");
    res.redirect("/appointments/review");
  } catch (err) {
    console.error("Failed to delete appointment:", err);
    req.flash("error_msg", "Something went wrong deleting the appointment.");
    res.redirect("/appointments/review");
  }
}

async function updateAppointment(req, res) {
  try {
    const appointment_id = parseInt(req.params.id);
    const price = parseFloat(req.body.price);
    const notes = req.body.notes || null;

    if (isNaN(appointment_id) || isNaN(price)) {
      req.flash("error_msg", "Invalid appointment data.");
      return res.redirect("/appointments/review");
    }

    await updateAppointmentDetails(appointment_id, price, notes);
    req.flash("success_msg", "Appointment updated.");
    res.redirect("/appointments/review");
  } catch (err) {
    console.error("Failed to update appointment:", err);
    req.flash("error_msg", "Failed to update appointment.");
    res.redirect("/appointments/review");
  }
}


module.exports = {
  viewSavedAppointments,
  previewMonthlySchedule,
  saveFinalizedSchedule,
  saveScheduleDraft,
  clearScheduleDraft,
  deleteAppointment,
  updateAppointment,
};
