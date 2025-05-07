function checkAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.account_type.toLowerCase() === "admin") {
    console.log("User account_type:", req.user?.account_type);

    return next();
  }

  req.flash("error_msg", "Access denied. Admins only.");
  return res.redirect("/");
}

module.exports = checkAdmin;
