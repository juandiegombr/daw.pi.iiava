import { Sequelize } from "sequelize";

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
    }
  );
}

export default sequelize;
