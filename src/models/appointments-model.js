const pool = require("../config/db");

//====================================
// Get all upcoming appointments
//====================================
async function getUpcomingAppointments() {
  try {
    const sql = `
    SELECT 
      a.appointment_id,
      a.appointment_date,
      a.duration_hours,
      c.first_name,
      c.last_name,
      c.price,
      s.service_frequency
    FROM appointments a
    JOIN clients c ON a.client_id = c.client_id
    JOIN service_type s ON a.service_type_id = s.service_id
    WHERE 
      EXTRACT(YEAR FROM a.appointment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND EXTRACT(MONTH FROM a.appointment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND c.is_active_new = TRUE
    ORDER BY a.appointment_date ASC;
  `;

    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to get upcoming appointments: " + err.message);
  }
}


//====================================
// Create a new appointment
//====================================
async function createAppointment(data) {
  try {
    const sql = `
      INSERT INTO appointments (
        client_id,
        appointment_date,
        service_type_id,
        duration_hours,
        price,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const params = [
      data.client_id,
      data.appointment_date,
      data.service_type_id,
      data.duration_hours,
      data.price,
      data.notes,
    ];

    const result = await pool.query(sql + " RETURNING appointment_id", params);
    return result.rows[0].appointment_id;
  } catch (err) {
    throw new Error("Failed to insert appointment: " + err.message);
  }
}

//====================================
// Get all schedulable clients
//====================================
async function getSchedulableClients() {
  try {
    const sql = `
      SELECT 
        c.client_id,
        c.first_name,
        c.last_name,
        c.preferred_day,
        c.service_type_id,
        s.service_frequency,
        c.rotation,
        c.service_hours,
        c.is_active_new,
        c.price,
        (
          SELECT MAX(a.appointment_date)
          FROM appointments a
          WHERE a.client_id = c.client_id
        ) AS last_appointment_date
      FROM clients c
      JOIN service_type s ON c.service_type_id = s.service_id
      WHERE c.is_active_new = true
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to get schedulable clients: " + err.message);
  }
}

//====================================
// Delete an appointment
//====================================
async function deleteAppointmentById(id) {
  const query = "DELETE FROM appointments WHERE appointment_id = $1";
  await pool.query(query, [id]);
}

//====================================
// Get appointments by date
//====================================
async function getAppointmentsByDate(date) {
  const query = `
    SELECT a.*, c.first_name, c.last_name
    FROM appointments a
    JOIN clients c ON a.client_id = c.client_id
    WHERE a.appointment_date = $1
    ORDER BY a.appointment_date ASC
  `;
  const result = await pool.query(query, [date]);
  return result.rows;
}

//====================================
// Get appointments by date range
//====================================
async function getAppointmentsByRange(startDate, endDate) {
  const query = `
  SELECT a.*, c.first_name, c.last_name
  FROM appointments a
  JOIN clients c ON a.client_id = c.client_id
  WHERE a.appointment_date >= $1::date AND a.appointment_date <= $2::date
  ORDER BY a.appointment_date ASC
`;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
}

//====================================
// Update appointment details
//====================================
async function updateAppointmentDetails(id, price, notes) {
  const query = `
    UPDATE appointments
    SET price = $1,
        notes = $2
    WHERE appointment_id = $3
  `;
  await pool.query(query, [price, notes, id]);
}

module.exports = { 
  getUpcomingAppointments, 
  createAppointment, 
  getSchedulableClients,
  deleteAppointmentById,
  getAppointmentsByDate,
  getAppointmentsByRange,
  updateAppointmentDetails 
}
