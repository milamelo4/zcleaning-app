// insert new client
const pool = require("../config/db.js");

//====================================
// Create a new client
//====================================
async function createClient(data) {
  try {
    const sql = `
      INSERT INTO clients 
      (first_name, last_name, phone_number, hired_date, service_hours, preferred_day, service_type_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
      data.is_active || 'active'
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (err) {
    throw new Error('Failed to create client: ' + err.message);
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
      s.service_frequency, c.is_active,
      a.street, a.city, a.zip, a.garage_code
    FROM clients AS c
    JOIN service_type AS s ON c.service_type_id = s.service_id
    LEFT JOIN address AS a ON c.client_id = a.client_id
  `;

  const params = [];

  if (statusFilter !== "all") {
    sql += ` WHERE c.is_active = $1`;
    params.push(statusFilter);
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


module.exports = {
  createClient,
  getServiceTypes,
  getAllClients,
  deleteById,
};
