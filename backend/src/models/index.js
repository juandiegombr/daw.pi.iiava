import sequelize from "../db/sequelize.js";
import Sensor from "./Sensor.js";
import DataPoint from "./DataPoint.js";
import Alert from "./Alert.js";
import User from "./User.js";

// Define associations
Sensor.hasMany(DataPoint, {
  foreignKey: "sensorId",
  onDelete: "CASCADE",
});

DataPoint.belongsTo(Sensor, {
  foreignKey: "sensorId",
});

Sensor.hasMany(Alert, {
  foreignKey: "sensorId",
  onDelete: "CASCADE",
});

Alert.belongsTo(Sensor, {
  foreignKey: "sensorId",
});

export { sequelize, Sensor, DataPoint, Alert, User };
