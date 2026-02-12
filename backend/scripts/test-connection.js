import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

async function testConnection() {
  try {
    console.log("Testing Azure MySQL connection...");
    console.log(`Host: ${process.env.MYSQL_HOST}`);
    console.log(`User: ${process.env.MYSQL_USER}`);
    console.log(`Database: ${process.env.MYSQL_DATABASE}`);
    console.log("");

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: {
        rejectUnauthorized: false,  // Azure MySQL certificate validation
      },
    });

    console.log("✅ Connection successful!");

    // Test query
    const [rows] = await connection.query("SELECT 1 as test");
    console.log("✅ Query test successful:", rows);

    await connection.end();
    console.log("✅ Connection closed");
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    process.exit(1);
  }
}

testConnection();
