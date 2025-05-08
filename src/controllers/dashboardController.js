exports.dashboard = (req, res) => {
  res.render("pages/dashboard", {
    title: "Dashboard",
    messages: req.flash(),
    user: req.user,
  });
};
