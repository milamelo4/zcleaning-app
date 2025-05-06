const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { postNewClient, showAddClientForm, showAllClients } = require("../controllers/clients-controller");

const validateClient = require("../validations/client-validation");
const handleValidationErrors = require("../middleware/handleValidationErrors");

//  Route to add a new client
router.get("/add", isLoggedIn, showAddClientForm);

// Route to view all clients
router.get("/", isLoggedIn, showAllClients);

// Form submission
router.post("/add", isLoggedIn, validateClient, handleValidationErrors, postNewClient);

module.exports = router;
