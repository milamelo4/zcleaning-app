const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const { postNewClient, showAddClientForm, showAllClients } = require("../controllers/clients-controller");

//  Route to add a new client
router.get("/add", isLoggedIn, showAddClientForm);

// Route to view all clients
router.get("/", isLoggedIn, showAllClients);

// Form submission
router.post("/add", isLoggedIn, postNewClient);

module.exports = router;
