const express= require('express');
const isLoggedIn = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/checkAdmin");

const router= express.Router();
const {
  showUserRolesPage,
  updateUserRole,
  showCreateEmployeeForm,
  createEmployeeProfile,
} = require("../controllers/admin-controller");


router.get('/promote', isLoggedIn, checkAdmin, showUserRolesPage);

router.post("/promote", isLoggedIn, checkAdmin, updateUserRole);

router.get("/create-employee/:accountId", isLoggedIn, checkAdmin, showCreateEmployeeForm);

router.post("/create-employee/:accountId", isLoggedIn, checkAdmin, createEmployeeProfile);

module.exports = router;