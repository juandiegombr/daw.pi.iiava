import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

import { sequelize, User } from "../src/models/index.js";

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function seedUser() {
  try {
    console.log("Connecting to MySQL...");
    await sequelize.sync();
    console.log("Connected to MySQL\n");

    const username = await prompt("Username: ");
    if (!username) {
      console.error("Username is required");
      process.exit(1);
    }

    const password = await prompt("Password: ");
    if (!password) {
      console.error("Password is required");
      process.exit(1);
    }

    const roleInput = await prompt("Role (admin/user) [user]: ");
    const role = roleInput === "admin" ? "admin" : "user";

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      console.error(`\nUser "${username}" already exists`);
      process.exit(1);
    }

    const user = await User.create({ username, password, role });
    console.log(`\nUser created successfully:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role:     ${user.role}`);
  } catch (error) {
    console.error("Error creating user:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seedUser();
