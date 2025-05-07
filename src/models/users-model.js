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


module.exports = {
    createUser,
    findUserByEmail,
};