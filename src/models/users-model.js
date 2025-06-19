const pool = require('../config/db.js');

//====================================
// Create a new user
//====================================
async function createUser(
  firstName,
  lastName,
  email,
  profileImage,
  accountType = "unauthorized"
) {
  try {
    const sql = `
      INSERT INTO users (account_firstname, account_lastname, account_email, profile_image_url, account_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(sql, [
      firstName,
      lastName,
      email,
      profileImage,
      accountType,
    ]);
    return result.rows[0];
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error(`User creation failed: ${err.message}`);
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
    console.error("Could not finding user by email:", err);
    throw new Error(`Failed to find user by email: ${err.message}`);
  }
}

//====================================
// Get all users
//====================================
async function getAllUsers() {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM users ORDER BY account_type"
    );
    return result.rows;
  } catch (err) {
    console.error("Error getting all users:", err);
    throw new Error(`Failed to get all users: ${err.message}`);
  }
}

//====================================
// Update user role
//====================================
async function updateRole(account_id, new_role) {
  try {
    const query = `
      UPDATE users
      SET account_type = $1
      WHERE account_id = $2
    `;
    const values = [new_role.toLowerCase(), account_id];
    return await pool.query(query, values);
  } catch (err) {
    console.error("Error updating user role:", err);
    throw new Error(`Failed to update user role: ${err.message}`);
  }
}

//====================================
// Update profile image URL
//====================================
async function updateProfileImage(email, imageUrl) {
  const sql = `UPDATE users SET profile_image_url = $1 WHERE account_email = $2`;
  await pool.query(sql, [imageUrl, email]);
}

//====================================
// Get user by ID
//====================================
async function getUserById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email
      FROM users
      WHERE account_id = $1
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (err) {
    console.error("Error finding user by ID: ", err);
    throw new Error(`Failed to find user by ID: ${err.message}`);
  }
}

module.exports = {
    createUser,
    findUserByEmail,
    getAllUsers,
    updateRole,
    updateProfileImage,
    getUserById,
};