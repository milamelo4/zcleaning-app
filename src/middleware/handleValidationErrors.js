const { validationResult } = require("express-validator");
const { getServiceTypes } = require("../models/clients-model");

async function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const serviceTypes = await getServiceTypes();

    // Check if we're editing or adding
    const isEdit = req.originalUrl.includes("/update/");

    return res.render(
      isEdit ? "pages/clients/edit-clients" : "pages/clients/add-clients",
      {
        title: isEdit ? "Edit Client" : "Add Client",
        errors: errors.array(),
        oldData: {
          ...req.body,
          client_id: req.params.id, 
        },
        serviceTypes,
        messages: {},
        user: req.user,
      }
    );
  }

  next();
}

module.exports = handleValidationErrors;
