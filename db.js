const mysql = require("mysql2");
const util = require("util");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Create MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Check Database Connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ Connected to MySQL!");
    connection.release();
  }
});

// Convert db.query into a Promise-based function
const query = util.promisify(pool.query).bind(pool);

module.exports = { query, pool };
﻿
