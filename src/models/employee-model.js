const pool = require('../config/db');

//====================================
// Get all employees
//====================================
async function getAllEmployees() {
  const sql = `
      SELECT employee_id, first_name, last_name, phone_number, hire_date, hourly_pay_rate, employment_status, is_active
      FROM employee
      ORDER BY last_name, first_name
    `;
  const result = await pool.query(sql);
  return result.rows;
}

module.exports = {
  getAllEmployees,
};