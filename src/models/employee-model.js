const pool = require('../config/db');

//====================================
// Get all employees
//====================================
async function getAllEmployees() {
  try {
    const sql = `
       SELECT 
      employee_id,
      first_name,
      last_name,
      phone_number,
      email,
      hire_date,
      employment_status,
      hourly_pay_rate,
      is_active
    FROM employee
    ORDER BY last_name
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("Error fetching employees:", err);
    throw new Error("Failed to get employees: " + err.message);
  }
}

//====================================
// Get employee profile by email
//====================================
async function getEmployeeProfileByEmail(email) {
  try {
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
  } catch (err) {
    console.error("Error fetching employee by email:", err);
    throw new Error("Failed to get employee profile by email: " + err.message);
  }
}

//====================================
// Get employee profile by account ID
//====================================
async function getEmployeeProfileByAccountId(accountId) {
  try {  
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
  } catch (err) {
    console.error("Error fetching employee by account ID:", err);
    throw new Error("Failed to get employee profile by account ID: " + err.message);
  }
}

//====================================
// Insert new employee profile
//====================================
async function insertEmployee(employeeData) {
  try {
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
      RETURNING employee_id
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

    const result = await pool.query(sql, values);
    return result.rows[0];   
  } catch (err) {
    console.error("Error inserting employee:", err);
    throw new Error(`Failed to insert employee: ${err.message}`);
  }
}

//====================================
// Check if employee exists by account ID
//====================================
async function checkIfEmployeeExists(account_id) {
  try{
    const sql = `SELECT employee_id FROM employee WHERE account_id = $1`;
    const result = await pool.query(sql, [account_id]);
    return result.rowCount > 0;
  } catch (err) {
    console.error("Error checking if employee exists:", err);
    throw new Error("Failed to check if employee exists: " + err.message);
  }
}

//====================================
//Delete employee by ID
//====================================
async function deleteEmployeeById(employeeId) {
  try {
    const sql = `DELETE FROM employee WHERE employee_id = $1`;
    await pool.query(sql, [employeeId]);
  } catch (err) {
    console.error("Error deleting employee:", err);
    throw new Error("Failed to delete employee: " + err.message);
  }
}

//=====================================
// Get employee by ID
//=====================================
async function getEmployeeById(employeeId) {
  try {
    const sql = `
      SELECT 
        employee_id,
        first_name,
        last_name,
        phone_number,
        email,
        hire_date,
        employment_status,
        hourly_pay_rate,
        is_active
      FROM employee
      WHERE employee_id = $1
    `;
    const result = await pool.query(sql, [employeeId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching employee by ID:", err);
    throw new Error("Failed to get employee by ID: " + err.message);
  }
}

//=====================================
// Update employee profile
//=====================================
async function updateEmployeeById(id, data) {
  const sql = `
    UPDATE employee SET
      first_name = $1,
      last_name = $2,
      phone_number = $3,
      email = $4,
      hire_date = $5,
      employment_status = $6,
      hourly_pay_rate = $7,
      is_active = $8,
      last_update = CURRENT_TIMESTAMP
    WHERE employee_id = $9
  `;

  const values = [
    data.first_name,
    data.last_name,
    data.phone_number,
    data.email,
    data.hire_date,
    data.employment_status,
    data.hourly_pay_rate,
    data.is_active,
    id,
  ];

  try {
    await pool.query(sql, values);
  } catch (err) {
    console.error("Error updating employee:", err);
    throw new Error("Failed to update employee: " + err.message);
  }
}


module.exports = {
  getAllEmployees,
  getEmployeeProfileByEmail,
  getEmployeeProfileByAccountId,
  insertEmployee,
  checkIfEmployeeExists,
  deleteEmployeeById,
  getEmployeeById,
  updateEmployeeById,
};