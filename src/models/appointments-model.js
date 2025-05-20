const pool = require("../config/db");

async function getUpcomingAppointments() {
  try {
    const sql = `
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.duration_hours,
        a.price,
        a.notes,
        c.first_name,
        c.last_name,
        s.service_frequency
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN service_type s ON a.service_type_id = s.service_id
      WHERE a.appointment_date >= CURRENT_DATE
      AND c.is_active_new = TRUE
      ORDER BY a.appointment_date ASC;
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to get upcoming appointments: " + err.message);
  }
}

module.exports = { getUpcomingAppointments };
