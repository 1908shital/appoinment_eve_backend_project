const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../src/.env") });

const pool = require("../src/config/database");

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("Starting database migrations...");
    const sqlFilePath = path.join(__dirname, "001_init_schema.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    await client.query(sql);
    console.log("Database migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
