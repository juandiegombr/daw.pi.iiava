import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const DataPoint = sequelize.define(
  "DataPoint",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sensorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sensors",
        key: "id",
      },
    },
    valueInt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    valueFloat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    valueBoolean: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    valueString: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "datapoints",
    timestamps: false,
    indexes: [
      { fields: ["sensorId"] },
      { fields: ["timestamp"] },
      { fields: ["sensorId", "timestamp"] },
    ],
  }
);

// Virtual getter for value based on which column has data
DataPoint.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;

  // Determine value from type-specific columns
  if (values.valueInt !== null) {
    values.value = values.valueInt;
  } else if (values.valueFloat !== null) {
    values.value = values.valueFloat;
  } else if (values.valueBoolean !== null) {
    values.value = values.valueBoolean;
  } else if (values.valueString !== null) {
    values.value = values.valueString;
  }

  // Remove type-specific columns from output
  delete values.valueInt;
  delete values.valueFloat;
  delete values.valueBoolean;
  delete values.valueString;

  return values;
};

// Helper to set value based on sensor type
DataPoint.setValueByType = function (sensorType, value) {
  const valueFields = {
    valueInt: null,
    valueFloat: null,
    valueBoolean: null,
    valueString: null,
  };

  switch (sensorType) {
    case "int":
      valueFields.valueInt = value;
      break;
    case "float":
      valueFields.valueFloat = value;
      break;
    case "boolean":
      valueFields.valueBoolean = value;
      break;
    case "string":
      valueFields.valueString = value;
      break;
  }

  return valueFields;
};

export default DataPoint;
