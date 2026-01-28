import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Sensor = sequelize.define(
  "Sensor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    alias: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("int", "float", "boolean", "string"),
      allowNull: false,
    },
  },
  {
    tableName: "sensors",
    timestamps: true,
  }
);

// Transform to include _id for frontend compatibility
Sensor.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

export default Sensor;
