const { validationResult } = require("express-validator");
const { getServiceTypes } = require("../models/clients-model"); // needed to re-render form

async function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const serviceTypes = await getServiceTypes(); // required dropdown
    return res.render("pages/clients/add-clients", {
      title: "Add Client",
      errors: errors.array(),
      oldData: req.body,
      serviceTypes,
      messages: {}, // no flash messages
    });
  }
  next();
}

module.exports = handleValidationErrors;
