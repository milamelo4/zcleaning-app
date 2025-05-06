const pool = require("../config/db");

async function createAddress(addressData) {
  const sql = `
    INSERT INTO address (street, city, zip, garage_code, client_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [
    addressData.street,
    addressData.city,
    addressData.zip,
    addressData.garage_code,
    addressData.client_id,
  ];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

module.exports = {
  createAddress,
};
