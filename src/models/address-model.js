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

async function updateAddressByClientId(clientId, addressData) {
  const sql = `
    UPDATE address
    SET street = $1, city = $2, zip = $3, garage_code = $4
    WHERE client_id = $5
  `;
  const values = [
    addressData.street,
    addressData.city,
    addressData.zip,
    addressData.garage_code,
    clientId,
  ];
  await pool.query(sql, values);
}


async function getAddressByClientId(clientId) {
  const result = await pool.query(
    "SELECT * FROM address WHERE client_id = $1",
    [clientId]
  );
  return result.rows[0]; // may be undefined — that's okay
} 

module.exports = {
  createAddress,
  updateAddressByClientId,
  getAddressByClientId,
};
