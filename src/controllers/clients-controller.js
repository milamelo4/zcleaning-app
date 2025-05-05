const { createClient, getServiceTypes, getAllClients } = require("../models/clients-model");

// Capitalize first letter, lowercase the rest
function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
async function postNewClient(req, res) {
  try {
    const clientData = {
      first_name: formatName(req.body.first_name),
      last_name: formatName(req.body.last_name),
      phone_number: req.body.phone_number,
      hired_date: req.body.hired_date,
      service_hours: req.body.service_hours,
      preferred_day: req.body.preferred_day,
      service_type_id: req.body.service_type_id,
      is_active: req.body.is_active,
    };

    const newClient = await createClient(clientData);

    req.flash("success_msg", "Client added successfully.");
    res.redirect("/clients"); // change this later to the correct route
  } catch (err) {
    console.error("Error creating client:", err);
    req.flash("error_msg", "Failed to add client.");
    res.redirect("/clients/add");
  }
}

async function showAddClientForm(req, res) {
  try {
    const serviceTypes = await getServiceTypes();
    res.render("pages/clients/add-clients", {
      title: "Add Client",
      messages: req.flash(),
      serviceTypes,
    });
  } catch (err) {
    console.error("Failed to load service types:", err);
    req.flash("error_msg", "Failed to load form.");
    res.redirect("/dashboard");
  }
}

async function showAllClients(req, res) {
  try {
    const clients = await getAllClients();
    res.render("pages/clients/list-clients", {
      title: "Client List",
      clients,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    req.flash("error_msg", "Failed to load clients.");
    res.redirect("/dashboard");
  }
}

module.exports = {
  postNewClient,
  showAddClientForm,
  showAllClients,
};
