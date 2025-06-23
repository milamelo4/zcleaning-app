const { getAllUsers, 
  getUserById, 
  updateRole 
} = require("../models/users-model");
const {
  insertEmployee,
  checkIfEmployeeExists,
  getAllEmployees,
  deleteEmployeeById,
  getEmployeeById,
  updateEmployeeById,
} = require("../models/employee-model");

const ALLOWED_ROLES = ["admin", "employee", "unauthorized"];

async function showUserRolesPage(req, res) {
  try {
    const users = await getAllUsers();

    res.render("pages/admin/promote", {
      title: "User Roles",
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

  // Validation
  if (!account_id || !new_role || !ALLOWED_ROLES.includes(new_role.toLowerCase())) {
    req.flash("error_msg", "Invalid user or role.");
    return res.redirect("/admin/promote");
  }

  try {
    await updateRole(account_id, new_role);
    req.flash("success_msg", "User role updated successfully.");
  } catch (err) {
    console.error("Error updating user role:", err);
    req.flash("error_msg", "There was a problem updating the user role.");
  }

  res.redirect("/admin/promote");
}

async function showCreateEmployeeForm(req, res) {
  const { accountId } = req.params;

  try {
    const user = await getUserById(accountId);
    if (!user) {
      req.flash("error_msg", "User not found.");
      return res.redirect("/admin/promote");
    }

    res.render("pages/admin/create-employee", {
      title: "Create Employee Profile",
      user, 
      });
  } catch (err) {
    console.error("Error loading form:", err);
    req.flash("error_msg", "Unable to load the employee form.");
    res.redirect("/admin/promote");
  }
}

async function createEmployeeProfile(req, res) {
  const { accountId } = req.params;
  const { phone_number, hire_date, hourly_pay_rate, employment_status, email } =
    req.body;

  try {
    const exists = await checkIfEmployeeExists(accountId);
    if (exists) {
      req.flash("error_msg", "This user already has an employee profile.");
      return res.redirect("/admin/promote");
    }

    await insertEmployee({
      account_id: accountId,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone_number,
      hire_date,
      hourly_pay_rate,
      employment_status,
      is_active: true,
      email,
    });

    req.flash("success_msg", "Employee profile created successfully.");
    res.redirect("/admin/promote");
  } catch (err) {
    console.error("Error creating employee:", err);
    req.flash("error_msg", "Failed to create employee profile.");
    res.redirect("/admin/create-employee/" + accountId);
  }
}

async function showAllEmployees(req, res) {
  try {
    const employees = await getAllEmployees();

    res.render("pages/admin/employees", {
      title: "All Employees",
      user: req.user,
      employees,
    });
  } catch (err) {
    console.error("Failed to load employees:", err);
    req.flash("error_msg", "Something went wrong loading employees.");
    res.redirect("/dashboard");
  }
}

async function deleteEmployee(req, res) {
  const employeeId = parseInt(req.params.id);
  try {
    await deleteEmployeeById(employeeId);
    req.flash("success_msg", "Employee deleted successfully.");
  } catch (error) {
    console.error("Failed to delete employee:", error);
    req.flash("error_msg", "Something went wrong deleting the employee.");
  }
  res.redirect("/admin/employees");
}

async function showEditEmployeeForm(req, res) {
  const employeeId = parseInt(req.params.id);
  try {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      req.flash("error_msg", "Employee not found.");
      return res.redirect("/admin/employees");
    }

    res.render("pages/admin/employee-edit", {
      title: "Edit Employee",
      user: req.user,
      employee,
    });
  } catch (error) {
    console.error("Failed to load employee:", error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/admin/employees");
  }
}

async function updateEmployeeProfile(req, res) {
  const employeeId = parseInt(req.params.id);
  const {
    first_name,
    last_name,
    phone_number,
    email,
    hire_date,
    employment_status,
    hourly_pay_rate,
    is_active,
  } = req.body;

  try {
    await updateEmployeeById(employeeId, {
      first_name,
      last_name,
      phone_number,
      email,
      hire_date: hire_date || null,
      employment_status,
      hourly_pay_rate: parseFloat(hourly_pay_rate),
      is_active: is_active === "true",
    });

    req.flash("success_msg", "Employee updated successfully.");
    res.redirect("/admin/employees");
  } catch (error) {
    console.error("Failed to update employee:", error);
    req.flash("error_msg", "Something went wrong updating the employee.");
    res.redirect("/admin/employees");
  }
}

module.exports = {
  showUserRolesPage,
  updateUserRole,
  showCreateEmployeeForm,
  createEmployeeProfile,
  showAllEmployees,
  deleteEmployee,
  showEditEmployeeForm,
  updateEmployeeProfile,
};