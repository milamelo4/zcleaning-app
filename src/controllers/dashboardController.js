const { getTotalClients } = require("../models/clients-model");

exports.dashboard = async (req, res) => {
  try {
    const totalClients = await getTotalClients();

    res.render("pages/dashboard", {
      title: "Dashboard",
      user: req.user,
      totalClients,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    req.flash("error_msg", "Unable to load dashboard.");
    res.redirect("/");
  }
};
