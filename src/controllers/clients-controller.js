const {
  createClient,
  getServiceTypes,
  getFilteredClients,
  deleteById,
  getClientById,
  updateClientById,
  getAllPaymentTypes,
  getAllMissingPayments,
  markPaymentAsReceived,
  unmarkPaymentAsReceived,
  findClientByNameAndPhone,
} = require("../models/clients-model");

const {
  createAddress,
  updateAddressByClientId,
  getAddressByClientId,
} = require("../models/address-model");

// Capitalize first letter, lowercase the rest
function formatName(name) {
  return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

async function postNewClient(req, res) {
  try {
    const isActiveNew = req.body.is_active_new === "true";
    const fullHouse = req.body.full_house === "true";

    const clientData = {
      first_name: formatName(req.body.first_name),
      last_name: formatName(req.body.last_name),
      phone_number: req.body.phone_number,
      hired_date: req.body.hired_date,
      service_hours: req.body.service_hours,
      preferred_day: req.body.preferred_day,
      service_type_id: req.body.service_type_id,
      is_active_new: isActiveNew,
      notes: req.body.notes,
      price: req.body.price,
      full_house: fullHouse,
    };

    // Check for existing client
    const existingClient = await findClientByNameAndPhone(
      clientData.first_name,
      clientData.last_name,
      clientData.phone_number
    );

    if (existingClient) {
      req.flash("error_msg", "Client already exists.");
      const serviceTypes = await getServiceTypes();
      return res.render("pages/clients/add-clients", {
        title: "Add Client",
        serviceTypes,
        oldData: req.body,
        user: req.user,
        errors: [],
      });
    }

    // Create new client + address
    const newClient = await createClient(clientData);
    await createAddress({
      street: req.body.street,
      city: req.body.city,
      zip: req.body.zip,
      garage_code: req.body.garage_code,
      client_id: newClient.client_id,
    });

    req.flash("success_msg", "Client added successfully.");
    res.redirect("/clients");
  } catch (err) {
    console.error("Error creating client:", err);
    req.flash("error_msg", "Failed to add client.");

    const serviceTypes = await getServiceTypes();
    res.render("pages/clients/add-clients", {
      title: "Add Client",
      serviceTypes,
      oldData: req.body,
      user: req.user,
      errors: [],
    });
  }
}


async function showAddClientForm(req, res) {
  try {
    const serviceTypes = await getServiceTypes();
    res.render("pages/clients/add-clients", {
      title: "Add Client",
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
    const statusFilter = req.query.status || "active"; // Default to "all" if no filter is provided
    const search =
      req.query.search
        ?.replace(/[\u200B-\u200D\uFEFF]/g, "")
        .trim()
        .toLowerCase() || "";
    const clients = await getFilteredClients(statusFilter, search);

    res.render("pages/clients/list-clients", {
      title: "Client List",
      clients,
      statusFilter,
      search,
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
      is_active_new: client.is_active_new,
      notes: client.notes,
      price: client.price,
      full_house: client.full_house,
    };

    res.render("pages/clients/edit-clients", {
      title: "Edit Client",
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
  const isActiveNew = req.body.is_active_new === "true";
  const fullHouse = req.body.full_house === "true";

  const {
    first_name,
    last_name,
    phone_number,
    hired_date,
    service_hours,
    preferred_day,
    service_type_id,
    street,
    city,
    zip,
    garage_code,
    notes,
    price,
  } = req.body;

  const clientData = {
    first_name,
    last_name,
    phone_number,
    hired_date,
    service_hours,
    preferred_day,
    service_type_id,
    is_active_new: isActiveNew,
    notes,
    price,
    full_house: fullHouse,
  };

  const addressData = {
    street,
    city,
    zip,
    garage_code,
  };

  try {
    await updateClientById(clientId, clientData);
    await updateAddressByClientId(clientId, addressData);

    req.flash("success_msg", "Client updated successfully");
    res.redirect("/clients");
  } catch (err) {
    console.error("Error updating client:", err);

    const serviceTypes = await getServiceTypes();

    res.render("pages/clients/edit-clients", {
      title: "Edit Client",
      errors: [{ msg: "Something went wrong, please try again." }],
      oldData: req.body,
      serviceTypes,
      user: req.user,
    });
  }
}

async function showClientPayments(req, res) {
  const clientId = req.params.id;

  try {
    const client = await getClientById(clientId);
    const payment_types = await getAllPaymentTypes(clientId);

    if (!client) {
      req.flash("error_msg", "Client not found.");
      return res.redirect("/clients");
    }

    if (!payment_types || payment_types.length === 0) {
      req.flash("error_msg", "No payment data found for this client.");
      return res.redirect("/clients");
    }

    res.render("pages/clients/client-payments", {
      title: `${client.first_name} ${client.last_name}'s Payments`,
      user: req.user,
      payment_types,
      clientId,
    });
  } catch (err) {
    console.error("Error loading payments:", err);
    req.flash("error_msg", "Could not load payment data.");
    res.redirect("/clients");
  }
}

async function showMissingPayments(req, res) {
  try {
    const missingPayments = await getAllMissingPayments();
    res.render("pages/clients/missing-payments", {
      title: "Missing Payments Report",
      missingPayments,
      user: req.user, 
      messages: req.flash(),
    });
  } catch (err) {
    console.error("Error loading missing payments:", err);
    req.flash("error_msg", "Failed to load missing payments.");
    res.redirect("/dashboard");
  }
}

async function markPaymentReceivedController(req, res) {
  const { clientId, paymentId } = req.params;

  try {
    await markPaymentAsReceived(paymentId, clientId);
    req.flash("success_msg", "Payment marked as received.");
    res.redirect(`/clients/${clientId}/payments`);
  } catch (err) {
    console.error("Error marking payment:", err);
    req.flash("error_msg", "Failed to update payment.");
    res.redirect(`/clients/${clientId}/payments`);
  }
}

async function unmarkPaymentReceivedController(req, res) {
  const { clientId, paymentId } = req.params;

  try {
    await unmarkPaymentAsReceived(paymentId, clientId);
    req.flash("success_msg", "Payment marked as unpaid.");
    res.redirect(`/clients/${clientId}/payments`);
  } catch (err) {
    console.error("Error unmarking payment:", err);
    req.flash("error_msg", "Failed to update payment.");
    res.redirect(`/clients/${clientId}/payments`);
  }
}

module.exports = {
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
};
