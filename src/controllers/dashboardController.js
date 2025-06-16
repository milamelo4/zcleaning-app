const { getTotalClients } = require("../models/clients-model");
const {
  getAppointmentsThisMonth,
  getTotalAllMissingPayments,
  getMonthlyRevenue,
} = require("../models/dashboard-model");

const { getAppointmentsForEmployee } = require("../models/appointments-model");
const { generateWhatsappSchedule }= require("../utils/formatWhatsappMessage");

async function dashboard(req, res) {
  try {
    const totalClients = await getTotalClients();
    const totalAppointments = await getAppointmentsThisMonth();
    const missingPayments = await getTotalAllMissingPayments();
    const monthlyRevenue = await getMonthlyRevenue();
    const totalFormat = monthlyRevenue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    res.render("pages/dashboard", {
      title: "Dashboard",
      user: req.user,
      totalClients,
      totalAppointments,
      missingPayments,
      monthlyRevenue: totalFormat,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    req.flash("error_msg", "Unable to load dashboard.");
    res.redirect("/");
  }
}

async function profile(req, res) {
  const type = req.user.account_type.toLowerCase();
  const allowed = ["admin", "employee", "supervisor"];

  if (!allowed.includes(type)) {
    req.flash("error_msg", "You are not authorized.");
    return res.redirect("/");
  }

  try {
    let groupedAppointments = {};

    if (type === "employee" || type === "admin") {
      const appointments = await getAppointmentsForEmployee();

      appointments.forEach((appt) => {
        const date = new Date(appt.appointment_date);
        const key = date.toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
        });

        if (!groupedAppointments[key]) groupedAppointments[key] = [];
        groupedAppointments[key].push(appt);
      });
    }

    res.render("pages/profile", {
      title: "Your Profile",
      user: req.user,
      groupedAppointments,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("Error loading profile page:", err);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/");
  }
}

module.exports = { dashboard, profile };