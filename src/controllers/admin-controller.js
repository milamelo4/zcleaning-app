const usersModel = require("../models/users-model");

async function showUserRolesPage(req, res) {
  try {
    const users = await usersModel.getAllUsers();

    res.render("pages/admin/promote", {
      title: "User Roles",
      messages: req.flash(),
      users,
      user: req.user,
      currentUser: req.user,
    });
  } catch (error) {
    console.error("Error loading users:", error);
    req.flash("error_msg", "Unable to load users.");
    res.redirect("/dashboard");
  }
}

async function updateUserRole(req, res) {
  const { account_id, new_role } = req.body;

  try {
    await usersModel.updateRole(account_id, new_role);
    req.flash("success_msg", "User role updated successfully.");
  } catch (err) {
    console.error("Error updating user role:", err);
    req.flash("error_msg", "There was a problem updating the user role.");
  }

  res.redirect("/admin/promote");
}

module.exports = {
  showUserRolesPage,
  updateUserRole,
};