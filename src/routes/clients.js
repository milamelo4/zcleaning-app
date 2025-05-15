const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { postNewClient, 
    showAddClientForm, 
    showAllClients, 
    deleteClient, 
    getEditClientView, 
    updateClient,
    showClientPayments,
    showMissingPayments,
 } = require("../controllers/clients-controller");
 const { getAllPaymentTypes } = require("../models/clients-model");

const validateClient = require("../validations/client-validation");
const handleValidationErrors = require("../middleware/handleValidationErrors");
const { getClientById } = require("../models/clients-model");

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

//route to get all payments for a client
router.get("/:id/payments", isLoggedIn, showClientPayments);

// Route to get all missing payment 
router.get("/missing-payments", isLoggedIn, showMissingPayments);

module.exports = router;
