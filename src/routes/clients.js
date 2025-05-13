const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { postNewClient, showAddClientForm, showAllClients, deleteClient, getEditClientView, updateClient } = require("../controllers/clients-controller");

const validateClient = require("../validations/client-validation");
const handleValidationErrors = require("../middleware/handleValidationErrors");

//  Route to add a new client
router.get("/add", isLoggedIn, showAddClientForm);

// Route to view all clients
router.get("/", isLoggedIn, showAllClients);

// Form submission
router.post("/add", isLoggedIn, validateClient, handleValidationErrors, postNewClient);

// delete client
router.post("/delete/:id", isLoggedIn, deleteClient);

// Route to edit a client
router.get("/edit/:id", isLoggedIn, getEditClientView);

// Route to update a client
router.post("/update/:id", isLoggedIn, validateClient, handleValidationErrors, updateClient);

module.exports = router;
