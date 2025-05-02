const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get("/test-insert", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO users (account_firstname, account_lastname) VALUES ($1, $2)",
      ["Camila", "Test"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Insert failed:", err);
    res.status(500).send("Insert failed");
  }
});


module.exports = router;