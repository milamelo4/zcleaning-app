const express= require('express');
const router= express.Router();
const { showUserRolesPage, updateUserRole } = require('../controllers/admin-controller');
const checkAdmin = require('../middleware/checkAdmin');

router.get('/promote', checkAdmin, showUserRolesPage);

router.post("/promote", checkAdmin, updateUserRole);

module.exports = router;