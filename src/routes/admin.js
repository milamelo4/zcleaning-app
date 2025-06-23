const express= require('express');
const isLoggedIn = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/checkAdmin");

const router= express.Router();
const {
  showUserRolesPage,
  updateUserRole,
  showCreateEmployeeForm,
  createEmployeeProfile,
  showAllEmployees,
  deleteEmployee,
  showEditEmployeeForm,
  updateEmployeeProfile
} = require("../controllers/admin-controller");

// Admin routes
router.get('/promote', isLoggedIn, checkAdmin, showUserRolesPage);

router.post("/promote", isLoggedIn, checkAdmin, updateUserRole);

router.get("/employees", isLoggedIn, checkAdmin, showAllEmployees);

router.get("/create-employee/:accountId", isLoggedIn, checkAdmin, showCreateEmployeeForm);

router.post("/create-employee/:accountId", isLoggedIn, checkAdmin, createEmployeeProfile);

router.post("/employees/delete/:id", isLoggedIn, checkAdmin, deleteEmployee);

router.get("/employees/edit/:id", isLoggedIn, checkAdmin, showEditEmployeeForm);

router.post("/employees/edit/:id", isLoggedIn, checkAdmin, updateEmployeeProfile);

module.exports = router;