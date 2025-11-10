import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "natek_user",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "natek_db",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

export default pool;