import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,       
  queueLimit: 0,            
  connectTimeout: 10000,
  // Query optimization
  namedPlaceholders: true,
  timezone: "+07:00",
});

// Test koneksi saat startup
pool.getConnection().then((conn) => {
  console.log("MySQL connected");
  conn.release();
}).catch((err) => {
  console.error("MySQL connection failed:", err.message);
  process.exit(1);
});

export default pool;