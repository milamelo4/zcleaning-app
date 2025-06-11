const pool = require("../config/db.js");

//====================================
// Create a new client
//====================================
async function createClient(data) {
  try {
    const sql = `
      INSERT INTO clients 
      (first_name, last_name, phone_number, hired_date, service_hours, preferred_day, service_type_id, is_active_new, notes, price, full_house)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      data.first_name,
      data.last_name,
      data.phone_number,
      data.hired_date,
      data.service_hours,
      data.preferred_day,
      data.service_type_id,
      data.is_active_new ?? true,
      data.notes,
      data.price,
      data.full_house,
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to create client: " + err.message);
  }
}

//====================================
// Get service types 
//====================================
async function getServiceTypes() {
  try {
    const sql = "SELECT * FROM service_type ORDER BY service_id";
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to get service types: " + err.message);
  }
}

//====================================
// Get all clients  
//====================================
async function getFilteredClients(statusFilter, search) {
  try {
    let sql = `
      SELECT 
        c.client_id, c.first_name, c.last_name, c.phone_number, 
        c.hired_date, c.service_hours, c.preferred_day, 
        s.service_frequency, 
        c.is_active_new,
        c.notes,
        c.price,
        c.full_house,
        a.street, a.city, a.zip, a.garage_code
      FROM clients AS c
      JOIN service_type AS s ON c.service_type_id = s.service_id
      LEFT JOIN address AS a ON c.client_id = a.client_id
      WHERE 1=1
    `;

    const params = [];

    // Add status condition
    if (statusFilter === "active") {
      sql += ` AND c.is_active_new = true`;
    } else if (statusFilter === "inactive") {
      sql += ` AND c.is_active_new = false`;
    }

    // Add search condition
    if (search) {
      const paramIndex = params.length + 1;
      sql += ` AND (LOWER(c.first_name) LIKE $${paramIndex} OR LOWER(c.last_name) LIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }

    // Final ORDER BY should come last and only once
    sql += ` ORDER BY c.first_name ASC, c.last_name ASC`;

    const result = await pool.query(sql, params);

    return result.rows;
  } catch (err) {
    throw new Error("Failed to get filtered clients: " + err.message);
  }
}

//====================================
// Get total number of clients
//====================================
async function getTotalClients() {
  try {
    const sql = `SELECT COUNT(*) FROM clients WHERE is_active_new = true;`;
    const result = await pool.query(sql);
    return parseInt(result.rows[0].count, 10);
  } catch (err) {
    throw new Error("Failed to count clients: " + err.message);
  }
}

//====================================
// Delete a client by ID  
//====================================
async function findClientByNameAndPhone(firstName, lastName, phoneNumber) {
  const sql = `
    SELECT * FROM clients
    WHERE LOWER(first_name) = LOWER($1)
      AND LOWER(last_name) = LOWER($2)
      AND phone_number = $3
  `;
  const result = await pool.query(sql, [firstName, lastName, phoneNumber]);
  return result.rows[0]; // will be undefined if not found
}

async function deleteById(id) {
  try {
    const sql = "DELETE FROM clients WHERE client_id = $1";
    const result = await pool.query(sql, [id]);
    return result; // You can check result.rowCount in the controller
  } catch (err) {
    throw new Error("Failed to delete client: " + err.message);
  }
}

//====================================
// Get a client by ID  
//====================================
async function getClientById(clientId) {
  try {
    const result = await pool.query(
      `
      SELECT client_id, first_name, last_name, phone_number, hired_date, service_hours, preferred_day, 
      service_type_id, is_active_new, notes, price, full_house
      FROM clients 
      WHERE client_id = $1
    `,
      [clientId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to get client by ID: " + err.message);
  }
}

//====================================
// Update a client by ID
//====================================
async function updateClientById(clientId, clientData) {
  try {
    const {
      first_name,
      last_name,
      phone_number,
      hired_date,
      service_hours,
      preferred_day,
      service_type_id,
      is_active_new,
      notes,
      price,
      full_house,
    } = clientData;

    const query = `
      UPDATE clients
      SET first_name = $1,
          last_name = $2,
          phone_number = $3,
          hired_date = $4,
          service_hours = $5,
          preferred_day = $6,
          service_type_id = $7,
          is_active_new = $8,
          notes = $9,
          price = $10,
          full_house = $11
      WHERE client_id = $12
    `;

    const result = await pool.query(query, [
      first_name,
      last_name,
      phone_number,
      hired_date,
      service_hours,
      preferred_day,
      service_type_id,
      is_active_new,
      notes,
      price,
      full_house,
      clientId,
    ]);
    return result; // You can check result.rowCount in the controller
  } catch (err) {
    throw new Error("Failed to update client: " + err.message);
  }
}

//====================================
// Get payments by client ID  
//====================================
async function getAllPaymentTypes(clientId) {
  try {
    const sql = `
    SELECT 
      cp.payment_id,
      cp.payment_type, 
      cp.payment_schedule, 
      cp.due_date, 
      cp.received_date,
      cp.expected_received_date,
      (cp.received_date IS NULL AND cp.expected_received_date < CURRENT_DATE) AS is_overdue,
      c.first_name, 
      c.last_name, 
      c.price 
    FROM client_payment cp
    JOIN clients c ON cp.client_id = c.client_id
    WHERE cp.client_id = $1
    ORDER BY cp.due_date DESC
  `;

    const result = await pool.query(sql, [clientId]);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to get payment types: " + err.message);
  }
}

//====================================
// Get all missing payments 
//====================================
async function getAllMissingPayments() {
  try {
    const sql = `
      SELECT 
      cp.payment_id,
      cp.payment_type,
      cp.payment_schedule,
      cp.due_date,
      cp.received_date,
      cp.expected_received_date,
      (cp.received_date IS NULL AND cp.expected_received_date < CURRENT_DATE) AS is_overdue,
      c.client_id,
      c.first_name,
      c.last_name,
      c.price
    FROM client_payment cp
    JOIN clients c ON cp.client_id = c.client_id
    WHERE cp.received_date IS NULL
      AND cp.expected_received_date < CURRENT_DATE
    ORDER BY cp.expected_received_date DESC;
  `;

    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to get missing payments: " + err.message);
  }
}
//====================================
// Mark payment as received
//====================================
async function markPaymentAsReceived(paymentId, clientId) {
  try {
    const sql = `
      UPDATE client_payment
      SET received_date = CURRENT_DATE
      WHERE payment_id = $1 AND client_id = $2
    `;
    const result = await pool.query(sql, [paymentId, clientId]);
    return result; // You can check result.rowCount in the controller
  } catch (err) {
    throw new Error("Failed to mark payment as received: " + err.message);
  }
}

//====================================
// Unmark payment as received
//====================================
async function unmarkPaymentAsReceived(paymentId, clientId) {
  try {
    const sql = `
      UPDATE client_payment
      SET received_date = NULL
      WHERE payment_id = $1 AND client_id = $2
    `;
    const result = await pool.query(sql, [paymentId, clientId]);
    return result; // You can check result.rowCount in the controller
  } catch (err) {
    throw new Error("Failed to unmark payment as received: " + err.message);
  }
}

//====================================
// Insert payment if it doesn't exist for the given client and appointment date
//====================================
async function insertPaymentIfNeeded(client_id, appointment_date) {
  // Convert appointment_date to plain YYYY-MM-DD string
  const due_date = new Date(appointment_date).toISOString().slice(0, 10);

  // Check if payment for this client and date already exists
  const sqlCheck = `
    SELECT 1 FROM client_payment
    WHERE client_id = $1 AND due_date = $2
    LIMIT 1
  `;
  const existing = await pool.query(sqlCheck, [client_id, due_date]);

  if (existing.rowCount > 0) {
    console.log(
      `Skipped: payment already exists for client ${client_id} on ${due_date}`
    );
    return;
  }

  // Calculate expected received date (7 days after due date)
  const expectedDateObj = new Date(appointment_date);
  expectedDateObj.setDate(expectedDateObj.getDate() + 7);
  const expected_received_date = expectedDateObj.toISOString().slice(0, 10);

  // Insert new payment
  const sqlInsert = `
    INSERT INTO client_payment (
      client_id,
      payment_type,
      payment_schedule,
      due_date,
      expected_received_date
    ) VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(sqlInsert, [
    client_id,
    "cash", // default value
    "monthly", // hardcoded for now
    due_date,
    expected_received_date,
  ]);
}


//====================================
// Show all payments
//====================================
async function getAllPayments() {
  const sql = `
    SELECT 
      cp.payment_id,
      cp.payment_type,
      cp.payment_schedule,
      cp.due_date,
      cp.received_date,
      cp.expected_received_date,
      a.price,
      c.first_name,
      c.last_name,
      c.client_id
    FROM client_payment cp
    JOIN clients c ON cp.client_id = c.client_id
    JOIN appointments a ON cp.client_id = a.client_id AND cp.due_date = a.appointment_date
    ORDER BY cp.due_date ASC
  `;

  const result = await pool.query(sql);
  return result.rows;
}



module.exports = {
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
  getTotalClients,
  insertPaymentIfNeeded,
  getAllPayments,
}
