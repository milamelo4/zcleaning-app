exports.dashboard = (req, res) => {
  res.render("pages/dashboard", {
    title: "Dashboard",
    user: req.user,
  });
};
