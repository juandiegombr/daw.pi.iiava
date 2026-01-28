import sequelize from "../db/sequelize.js";
import Sensor from "./Sensor.js";
import DataPoint from "./DataPoint.js";

// Define associations
Sensor.hasMany(DataPoint, {
  foreignKey: "sensorId",
  onDelete: "CASCADE",
});

DataPoint.belongsTo(Sensor, {
  foreignKey: "sensorId",
});

export { sequelize, Sensor, DataPoint };
