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

//====================================
// Get employee profile by email
//====================================
async function getEmployeeProfileByEmail(email) {
  const sql = `
    SELECT
      first_name,
      last_name,
      phone_number,
      hire_date,
      employment_status,
      hourly_pay_rate,
      is_active
    FROM employee
    WHERE email = $1
  `;
  const result = await pool.query(sql, [email]);
  return result.rows[0]; // Expecting one match per email
}

//====================================
// Get employee profile by account ID
//====================================
async function getEmployeeProfileByAccountId(accountId) {
  const sql = `
    SELECT
      first_name,
      last_name,
      phone_number,
      hire_date,
      employment_status,
      hourly_pay_rate,
      is_active
    FROM employee
    WHERE account_id = $1
  `;
  const result = await pool.query(sql, [accountId]);
  return result.rows[0];
}

//====================================
// Insert new employee profile
//====================================
async function insertEmployee(employeeData) {
  const {
    account_id,
    first_name,
    last_name,
    phone_number,
    hire_date,
    hourly_pay_rate,
    employment_status,
    is_active,
    email,
  } = employeeData;

  const sql = `
    INSERT INTO employee (
      account_id,
      first_name,
      last_name,
      phone_number,
      hire_date,
      hourly_pay_rate,
      employment_status,
      is_active,
      email
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;

  const values = [
    account_id,
    first_name,
    last_name,
    phone_number,
    hire_date,
    hourly_pay_rate,
    employment_status,
    is_active,
    email,
  ];

  await pool.query(sql, values);
}

//====================================
// Check if employee exists by account ID
//====================================
async function checkIfEmployeeExists(account_id) {
  const sql = `SELECT employee_id FROM employee WHERE account_id = $1`;
  const result = await pool.query(sql, [account_id]);
  return result.rowCount > 0;
}

module.exports = {
  getAllEmployees,
  getEmployeeProfileByEmail,
  getEmployeeProfileByAccountId,
  insertEmployee,
  checkIfEmployeeExists,
};