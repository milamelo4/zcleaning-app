// insert new client
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
  const sql = "SELECT * FROM service_type ORDER BY service_id";
  const result = await pool.query(sql);
  return result.rows;
}

//====================================
// Get all clients  
//====================================
async function getAllClients(statusFilter) {
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
  `;

  const params = [];

  if (statusFilter === "active") {
    sql += ` WHERE c.is_active_new = true`;
  } else if (statusFilter === "inactive") {
    sql += ` WHERE c.is_active_new = false`;
  }

  sql += ` ORDER BY c.client_id`;

  const result = await pool.query(sql, params);
  return result.rows;
}

//====================================
// Delete a client by ID  
//====================================
async function deleteById(id) {
  const sql = "DELETE FROM clients WHERE client_id = $1";
  await pool.query(sql, [id]);
}

//====================================
// Get a client by ID  
//====================================
async function getClientById(clientId) {
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
}

//====================================
// Update a client by ID
//====================================
async function updateClientById(clientId, clientData) {
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

  await pool.query(query, [
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
}

//====================================
// Get payments by client ID  
//====================================
async function getAllPaymentTypes(clientId) {
  const sql = `
  SELECT 
    cp.payment_type, 
    cp.payment_schedule, 
    cp.due_date, 
    cp.received_date,
    cp.expected_received_date,
    (cp.received_date IS NULL AND cp.due_date < CURRENT_DATE) AS is_overdue,
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
}



module.exports = {
  createClient,
  getServiceTypes,
  getAllClients,
  deleteById,
  getClientById,
  updateClientById,
  getAllPaymentTypes,
};
