const pool = require("../config/db.js");

//====================================
// Get total number of appointments this month
//====================================
async function getAppointmentsThisMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const sql = `
      SELECT COUNT(*) FROM appointments
      WHERE appointment_date BETWEEN $1 AND $2
    `;
  const result = await pool.query(sql, [start, end]);
  return parseInt(result.rows[0].count, 10);
}

//====================================
// Get total number of missing payments 
//====================================
async function getTotalAllMissingPayments() {
  const sql = `
    SELECT COUNT(*) FROM client_payment
    WHERE received_date IS NULL AND due_date < CURRENT_DATE;
  `;
  const result = await pool.query(sql);
  return parseInt(result.rows[0].count, 10);
}

//====================================
// Get total revenue for the current month
//====================================
async function getMonthlyRevenue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const sql = `
      SELECT SUM(price) AS total
      FROM appointments
      WHERE EXTRACT(YEAR FROM appointment_date) = $1
        AND EXTRACT(MONTH FROM appointment_date) = $2
    `;

  const result = await pool.query(sql, [year, month]);
  return parseFloat(result.rows[0].total || 0);
}
  
  
module.exports = {
  getAppointmentsThisMonth,
  getTotalAllMissingPayments,
    getMonthlyRevenue
};
