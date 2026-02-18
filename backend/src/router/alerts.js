import express from "express";
import { Alert, Sensor } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.sensorId) {
      where.sensorId = req.query.sensorId;
    }

    const alerts = await Alert.findAll({
      where,
      include: { model: Sensor, attributes: ["alias", "type"] },
    });
    res.json({ data: { alerts } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { sensorId, condition, value, enabled } = req.body;

    if (!sensorId || !condition || value === undefined) {
      return res.status(400).json({ error: "sensorId, condition, and value are required" });
    }

    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }

    const alert = await Alert.create({ sensorId, condition, value, enabled });
    res.status(201).json({ data: { alert } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id);

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    const { sensorId, condition, value, enabled } = req.body;
    if (sensorId !== undefined) alert.sensorId = sensorId;
    if (condition !== undefined) alert.condition = condition;
    if (value !== undefined) alert.value = value;
    if (enabled !== undefined) alert.enabled = enabled;

    await alert.save();
    res.json({ data: { alert } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id);

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    await alert.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
