// src/config/db.js
// Central MySQL connection pool. Works with local MySQL (XAMPP, MySQL
// Workbench, mysql-server) and cloud MySQL providers (Railway, PlanetScale,
// Aiven, AWS RDS) — just point the .env values at whichever you're using.

const mysql = require('mysql2/promise');
require('dotenv').config();

const useSSL = String(process.env.DB_SSL).toLowerCase() === 'true';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'scisp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ...(useSSL ? { ssl: { rejectUnauthorized: true } } : {}),
});

/**
 * Quick startup check so misconfiguration fails loudly instead of on the
 * first request.
 */
async function verifyConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✔ MySQL connected → ${process.env.DB_HOST}/${process.env.DB_NAME}`);
  } catch (err) {
    console.error('✘ MySQL connection failed:', err.message);
    console.error('  Check your .env DB_HOST / DB_USER / DB_PASSWORD / DB_NAME values.');
  }
}

module.exports = { pool, verifyConnection };
