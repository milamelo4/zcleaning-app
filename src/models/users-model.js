const pool = require('../config/db.js');

//====================================
// Create a new user
//====================================
async function createUser(firstName, lastName, email, accountType = "unauthorized") {
  try {
    const sql = `
      INSERT INTO users (account_firstname, account_lastname, account_email, account_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(sql, [
      firstName,
      lastName,
      email,
      accountType,
    ]);
    return result.rows[0];
  } catch (err) {
    throw new Error("User creation failed: " + err.message);
  }
}

//====================================
// Check if email exists
//====================================
async function findUserByEmail(email) {
  try {
    const sql = "SELECT * FROM users WHERE account_email = $1";
    const result = await pool.query(sql, [email]);
    return result.rows[0]; // returns undefined if not found
  } catch (err) {
    throw new Error("Failed to find user: " + err.message);
  }
}

//====================================
// Get all users
//====================================
async function getAllUsers() {
  const result = await pool.query(
    "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM users ORDER BY account_type"
  );
  return result.rows;
}

//====================================
// Update user role
//====================================
async function updateRole(account_id, new_role) {
  const query = `
    UPDATE users
    SET account_type = $1
    WHERE account_id = $2
  `;
  const values = [new_role.toLowerCase(), account_id];
  return await pool.query(query, values);
}

module.exports = {
    createUser,
    findUserByEmail,
    getAllUsers,
    updateRole,
};