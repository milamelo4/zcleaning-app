const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/checkAdmin");
const {
  postNewClient,
  showAddClientForm,
  showAllClients,
  deleteClient,
  getEditClientView,
  updateClient,
  showClientPayments,
  showMissingPayments,
  markPaymentReceivedController,
  unmarkPaymentReceivedController,
  showAllPayments,

} = require("../controllers/clients-controller");

const validateClient = require("../validations/client-validation");
const handleValidationErrors = require("../middleware/handleValidationErrors");

//  Route to add a new client
router.get("/add", isLoggedIn, isAdmin ,showAddClientForm);

// Route to view all clients
router.get("/", isLoggedIn, isAdmin,showAllClients);

// Form submission
router.post("/add", isLoggedIn, isAdmin, validateClient, handleValidationErrors, postNewClient);

// delete client
router.post("/delete/:id", isLoggedIn, isAdmin, deleteClient);

// Route to edit a client
router.get("/edit/:id", isLoggedIn, isAdmin, getEditClientView);

// Route to update a client
router.post("/update/:id", isLoggedIn, isAdmin, validateClient, handleValidationErrors, updateClient);

//route to get all payments for a client
router.get("/:id/payments", isLoggedIn, isAdmin, showClientPayments);

// Route to get all missing payment 
router.get("/missing-payments", isLoggedIn, isAdmin, showMissingPayments);

// Route to post new payment
router.post(
  "/:clientId/payments/:paymentId/mark-paid",
  isLoggedIn,
  isAdmin,
  markPaymentReceivedController
);

// Route to unmark payment
router.post(
  "/:clientId/payments/:paymentId/unmark-paid",
  isLoggedIn,
  isAdmin,
  unmarkPaymentReceivedController
);

// route to show client payments
router.get("/all-payments", isLoggedIn, isAdmin, showAllPayments);  

module.exports = router;
