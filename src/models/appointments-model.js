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
async function createAppointment(appointment) {
  const {
    client_id,
    appointment_date,
    service_type_id,
    duration_hours,
    price,
    notes,
  } = appointment;

  // Step 1: Check for existing appointment
  const existsQuery = `
    SELECT 1 FROM appointments
    WHERE client_id = $1 AND appointment_date = $2
    LIMIT 1
  `;
  const existsResult = await pool.query(existsQuery, [
    client_id,
    appointment_date,
  ]);

  if (existsResult.rowCount > 0) {
        return; // skip insert
  }

  // Step 2: Insert appointment
  const insertQuery = `
    INSERT INTO appointments
      (client_id, appointment_date, service_type_id, duration_hours, price, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pool.query(insertQuery, [
    client_id,
    appointment_date,
    service_type_id,
    duration_hours,
    price,
    notes,
  ]);
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
async function deleteAppointmentById(appointmentId) {
  try {
    const result = await pool.query(
      "SELECT client_id, appointment_date FROM appointments WHERE appointment_id = $1",
      [appointmentId]
    );

    if (result.rows.length === 0) {
      // Appointment already deleted or never existed — not an error during syncing
      console.warn(
        `Appointment ID ${appointmentId} not found — skipping delete.`
      );
      return false;
    }

    const { client_id, appointment_date } = result.rows[0];

    // Delete the appointment
    await pool.query("DELETE FROM appointments WHERE appointment_id = $1", [
      appointmentId,
    ]);

    // Delete the payment with the same client and date
    await pool.query(
      "DELETE FROM client_payment WHERE client_id = $1 AND due_date = $2",
      [client_id, appointment_date]
    );

    return true;
  } catch (err) {
    console.error("Error deleting appointment and payment:", err);
    throw err;
  }
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
  // Update appointment
  const updateApptQuery = `
    UPDATE appointments
    SET price = $1,
        notes = $2
    WHERE appointment_id = $3
  `;
  await pool.query(updateApptQuery, [price, notes, id]);

  // Update matching payment (based on client + date)
  const fetchApptQuery = `
    SELECT client_id, appointment_date
    FROM appointments
    WHERE appointment_id = $1
  `;
  const result = await pool.query(fetchApptQuery, [id]);

  if (result.rowCount > 0) {
    const { client_id, appointment_date } = result.rows[0];

    const updatePaymentQuery = `
      UPDATE client_payment
      SET price = $1
      WHERE client_id = $2 AND due_date = $3
    `;
    await pool.query(updatePaymentQuery, [price, client_id, appointment_date]);
  }
}

//====================================
// Get appointments for employee in the next 14 days
//====================================
async function getAppointmentsForEmployee() {
  const sql = `
    SELECT 
      a.appointment_date,
      a.duration_hours,
      c.first_name,
      c.last_name
    FROM appointments a
    JOIN clients c ON a.client_id = c.client_id
    WHERE a.appointment_date >= CURRENT_DATE
      AND a.appointment_date < CURRENT_DATE + INTERVAL '14 days'
    ORDER BY a.appointment_date ASC;
  `;

  const result = await pool.query(sql);
  return result.rows;
}

module.exports = { 
  getUpcomingAppointments, 
  createAppointment, 
  getSchedulableClients,
  deleteAppointmentById,
  getAppointmentsByDate,
  getAppointmentsByRange,
  updateAppointmentDetails,
  getAppointmentsForEmployee 
}
