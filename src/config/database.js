const { Pool } = require("pg");

// handles multiple database requests 

const isCloudDb = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes("supabase") || process.env.DATABASE_URL.includes("neon") || process.env.DATABASE_URL.includes("sslmode=require"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isCloudDb && { ssl: { rejectUnauthorized: false } }),
});

// for test Database connection 
pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error("PostgreSQL error:", error);
});

module.exports = pool;