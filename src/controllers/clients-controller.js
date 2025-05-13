const {
  createClient,
  getServiceTypes,
  getAllClients,
  deleteById,
  getClientById,
  updateClientById,
} = require("../models/clients-model");

const {
  createAddress,
  updateAddressByClientId,
  getAddressByClientId,
} = require("../models/address-model");

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
    await createAddress({
      street: req.body.street,
      city: req.body.city,
      zip: req.body.zip,
      garage_code: req.body.garage_code,
      client_id: newClient.client_id, });

    req.flash("success_msg", "Client added successfully.");
    res.redirect("/clients"); 
  } catch (err) {
    console.error("Error creating client:", err);
    req.flash("error_msg", "Failed to add client.");

    const serviceTypes = await getServiceTypes();
    res.render("pages/clients/add-clients", {
      title: "Add Client",
      messages: req.flash(),
      serviceTypes,
      oldData: req.body,
      user: req.user,
    });
  }
}

async function showAddClientForm(req, res) {
  try {
    const serviceTypes = await getServiceTypes();
    res.render("pages/clients/add-clients", {
      title: "Add Client",
      messages: req.flash(),
      serviceTypes,
      oldData: {}, 
      errors: [],
      user: req.user,
      
    });
  } catch (err) {
    console.error("Failed to load service types:", err);
    req.flash("error_msg", "Failed to load form.");
    res.redirect("/dashboard");
  }
}

async function showAllClients(req, res) {
  try {
    const statusFilter = req.query.status || "all"; // Default to "all" if no filter is provided
    const clients = await getAllClients(statusFilter);
    res.render("pages/clients/list-clients", {
      title: "Client List",
      clients,
      messages: req.flash(),
      statusFilter,
      user: req.user,
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    req.flash("error_msg", "Failed to load clients.");
    res.redirect("/dashboard");
  }
}

async function deleteClient(req, res) {
  const clientId = req.params.id;
  try {
    const client = await deleteById(clientId); // this should check if the client exists
 // this should delete from the DB
    req.flash("success_msg", "Client deleted successfully.");
  } catch (err) {
    console.error("Error deleting clients:", err);
    req.flash("error_msg", "Error deleting client.");
  }
  res.redirect("/clients");
}

async function getEditClientView(req, res) {
  const clientId = req.params.id;

  try {
    const client = await getClientById(clientId);
    const address = await getAddressByClientId(clientId);
    const serviceTypes = await getServiceTypes();

    if (!client || !address) {
      req.flash("error_msg", "Client not found");
      return res.redirect("/clients");
    }

    const oldData = {
      client_id: client.client_id,
      first_name: client.first_name,
      last_name: client.last_name,
      phone_number: client.phone_number,
      street: address.street,
      city: address.city,
      zip: address.zip,
      garage_code: address.garage_code,
      hired_date: client.hired_date
        ? client.hired_date.toISOString().slice(0, 10)
        : "",
      service_hours: client.service_hours,
      preferred_day: client.preferred_day,
      service_type_id: client.service_type_id,
      is_active: client.is_active,
    };

    res.render("pages/clients/edit-clients", {
      title: "Edit Client",
      messages: req.flash(),
      errors: [],
      oldData,
      serviceTypes,
      user: req.user,
    });
  } catch (err) {
    console.error("Error loading client info:", err);
    req.flash("error_msg", "Something went wrong loading the client");
    res.redirect("/clients");
  }
}


async function updateClient(req, res) {
  const clientId = req.params.id;
  const {
    first_name,
    last_name,
    phone_number,
    hired_date,
    service_hours,
    preferred_day,
    service_type_id,
    is_active,
    street,
    city,
    zip,
    garage_code,
  } = req.body;

  const clientData = {
    first_name,
    last_name,
    phone_number,
    hired_date,
    service_hours,
    preferred_day,
    service_type_id,
    is_active,
  };

  const addressData = {
    street,
    city,
    zip,
    garage_code,
  };

  try {
    await updateClientById(clientId, clientData);
    console.log("addressData:", addressData);

    await updateAddressByClientId(clientId, addressData);

    req.flash("success_msg", "Client updated successfully");
    res.redirect("/clients");
  } catch (err) {
    console.error("Error updating client:", err);

    const serviceTypes = await getServiceTypes();

    res.render("clients/edit-clients", {
      title: "Edit Client",
      messages: req.flash(),
      errors: [{ msg: "Something went wrong, please try again." }],
      oldData: req.body,
      serviceTypes,
    });
  }
}

module.exports = {
  postNewClient,
  showAddClientForm,
  showAllClients,
  deleteClient,
  getEditClientView,
  updateClient,
};
