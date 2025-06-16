const express= require('express');
const router= express.Router();
const {
  showUserRolesPage,
  updateUserRole,
  showCreateEmployeeForm,
  createEmployeeProfile,
} = require("../controllers/admin-controller");

const checkAdmin = require('../middleware/checkAdmin');

router.get('/promote', checkAdmin, showUserRolesPage);

router.post("/promote", checkAdmin, updateUserRole);

router.get("/create-employee/:accountId", checkAdmin, showCreateEmployeeForm);

router.post("/create-employee/:accountId", checkAdmin, createEmployeeProfile);

module.exports = router;