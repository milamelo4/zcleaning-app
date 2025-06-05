const fs = require("fs");
const path = require("path");
const { createAppointment, getSchedulableClients,} = require("../models/appointments-model");
const { getClientsForMonth } = require("../utils/scheduleHelpers");

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

      req.session.scheduleDraft = scheduledClients;
      req.session.unassignedClients = unassignedClients;
    } else {
      const clients = await getSchedulableClients();
      const generated = getClientsForMonth(clients, targetYear, targetMonth);
      scheduledClients = generated.scheduledClients;
      unassignedClients = generated.unassignedClients;

      req.session.scheduleDraft = scheduledClients;
      req.session.unassignedClients = unassignedClients;
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


async function saveSuggestedSchedule(req, res) {
  try {
    const raw = req.body.appointments;
    //console.log("Raw input:", raw);

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

    for (const appt of appointments) {
      const client_id = parseInt(appt.client_id);
      const service_type_id = parseInt(appt.service_type_id);
      const duration_hours = parseFloat(appt.duration_hours);
      const price = appt.price !== undefined ? parseFloat(appt.price) : 0;
      const notes = appt.notes || null;

      if (
        isNaN(client_id) ||
        isNaN(service_type_id) ||
        isNaN(duration_hours) ||
        isNaN(price)
      ) {
        console.error("Skipping invalid appointment:", appt);
        continue;
      }

      await createAppointment({
        client_id,
        appointment_date: appt.appointment_date,
        service_type_id,
        duration_hours,
        price,
        notes,
      });
    }

    req.flash("success_msg", "Schedule saved successfully.");
    res.redirect("/appointments/schedule");
  } catch (err) {
    console.error("Error saving suggested schedule:", err);
    req.flash("error_msg", "Failed to save schedule.");
    res.redirect("/appointments/monthly-preview");
  }
}

async function reviewSavedSchedule(req, res) {
  const scheduleDraft = req.session.scheduleDraft;

  if (!scheduleDraft || !Array.isArray(scheduleDraft)) {
    req.flash("error_msg", "No schedule found to review.");
    return res.redirect("/appointments/monthly-preview");
  }
  // sort by appointment date
  scheduleDraft.sort(
    (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)
  );
  res.render("pages/appointments/review", {
    title: "Review Final Schedule",
    appointments: scheduleDraft,
    appointmentsJson: JSON.stringify(scheduleDraft),
    user: req.user,
  });
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

module.exports = {
  reviewSavedSchedule,
  previewMonthlySchedule,
  saveSuggestedSchedule,
  saveScheduleDraft,
  clearScheduleDraft,
};
