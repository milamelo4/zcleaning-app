const { getTotalClients } = require("../models/clients-model");
const { getAppointmentsThisMonth, getTotalAllMissingPayments, getMonthlyRevenue } = require("../models/dashboard-model");

exports.dashboard = async (req, res) => {
  try {
    const totalClients = await getTotalClients();
    const totalAppointments = await getAppointmentsThisMonth();
    const missingPayments = await getTotalAllMissingPayments();
    const monthlyRevenue = await getMonthlyRevenue();


    res.render("pages/dashboard", {
      title: "Dashboard",
      user: req.user,
      totalClients,
      totalAppointments,
      missingPayments,
      monthlyRevenue
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    req.flash("error_msg", "Unable to load dashboard.");
    res.redirect("/");
  }
};
