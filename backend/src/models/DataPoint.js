import mongoose from "mongoose";

const DataPointSchema = new mongoose.Schema(
  {
    sensorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sensor",
      required: true,
      index: true, // Index for efficient queries
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting and filtering
    },
  },
  { collection: "datapoint" }
);

// Compound index for efficient queries by sensor and timestamp
DataPointSchema.index({ sensorId: 1, timestamp: -1 });

const DataPoint = mongoose.model("DataPoint", DataPointSchema);

export default DataPoint;
