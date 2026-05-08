import { db } from "../db";
import { sql } from "drizzle-orm";

async function checkPostGIS() {
  try {
    const result = await db.execute(sql`SELECT postgis_version();`);
    console.log("✅ PostGIS is enabled:", result.rows[0]);
  } catch (error) {
    console.error("❌ PostGIS is NOT enabled or not installed.");
    try {
        console.log("Attempting to enable PostGIS...");
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis;`);
        console.log("✅ PostGIS has been enabled!");
    } catch (err) {
        console.error("❌ Failed to enable PostGIS. Please ensure it's installed on your PostgreSQL server.");
    }
  }
  process.exit(0);
}

checkPostGIS();
