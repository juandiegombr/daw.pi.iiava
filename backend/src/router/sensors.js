import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const SensorSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true },
    type: {
      type: String,
      enum: ["int", "float", "boolean", "string"],
      required: true,
    },
  },
  { collection: "sensor", timestamps: true }
);

const Sensor = mongoose.model("Sensor", SensorSchema);

router.get("/", async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json({ data: { sensors } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;