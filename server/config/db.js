const mysql = require('mysql2/promise');
require('dotenv').config();

const dbPassword = process.env.DB_PASSWORD;
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: dbPassword === '' || dbPassword === undefined ? undefined : dbPassword,
  database: process.env.DB_NAME || 'shm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
