function checkAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.account_type.toLowerCase() === "admin") {
    return next();
  }

  req.flash("error_msg", "Access denied. Admins only.");
  return res.redirect("/");
}

module.exports = checkAdmin;
