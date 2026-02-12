import { Sequelize } from "sequelize";
import {  dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isTest = process.env.NODE_ENV === "test";

let sequelize;

if (isTest) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false, // Required for Azure MySQL Flexible Server self-signed certs
        },
      },
    },
  );
}

export default sequelize;
