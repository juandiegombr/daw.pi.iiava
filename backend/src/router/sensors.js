import express from "express";
import { Op } from "sequelize";
import { Sensor, DataPoint, Alert } from "../models/index.js";
import sseService from "../services/sseService.js";

const router = express.Router();

const VALID_TYPES = ["int", "float", "boolean", "string"];

router.get("/", async (req, res) => {
  try {
    const sensors = await Sensor.findAll();
    res.json({ data: { sensors } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const sensor = await Sensor.create(req.body);
    res.status(201).json({ data: { sensor } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// SSE endpoint - must be BEFORE /:id routes
router.get("/events", (req, res) => {
  sseService.addClient(res);
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { alias, type } = req.body;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid sensor ID" });
    }

    if (!alias && !type) {
      return res.status(400).json({ error: "At least one field (alias or type) must be provided" });
    }

    if (type !== undefined && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid sensor type" });
    }

    const sensor = await Sensor.findByPk(parsedId);

    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }

    if (alias !== undefined) sensor.alias = alias;
    if (type !== undefined) sensor.type = type;

    await sensor.save();

    res.json({ data: { sensor } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id/datapoints", async (req, res) => {
  try {
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid sensor ID" });
    }

    const sensor = await Sensor.findByPk(parsedId);
    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }

    const { from, to } = req.query;
    const where = { sensorId: parsedId };
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }

    const datapoints = await DataPoint.findAll({
      where,
      order: [["timestamp", "DESC"]],
    });

    // Get enabled alerts for this sensor
    const alerts = await Alert.findAll({
      where: { sensorId: parsedId, enabled: true },
    });

    // Check each datapoint against alerts
    const datapointsWithAlerts = datapoints.map((dp) => {
      const dpJson = dp.toJSON();
      dpJson.isAlert = false;

      for (const alert of alerts) {
        const val = dpJson.value;
        if (typeof val !== "number") continue;

        let triggered = false;
        switch (alert.condition) {
          case ">": triggered = val > alert.value; break;
          case "<": triggered = val < alert.value; break;
          case ">=": triggered = val >= alert.value; break;
          case "<=": triggered = val <= alert.value; break;
          case "==": triggered = val == alert.value; break;
          case "!=": triggered = val != alert.value; break;
        }
        if (triggered) {
          dpJson.isAlert = true;
          dpJson.alertValue = alert.value;
          break;
        }
      }

      return dpJson;
    });

    res.json({
      data: {
        sensor,
        datapoints: datapointsWithAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/datapoints", async (req, res) => {
  try {
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid sensor ID" });
    }

    const sensor = await Sensor.findByPk(parsedId);
    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }

    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: "Value is required" });
    }

    const valueFields = DataPoint.setValueByType(sensor.type, value);
    const datapoint = await DataPoint.create({
      sensorId: parsedId,
      ...valueFields,
    });

    sseService.sendDatapointCreated(datapoint, sensor);

    // Check alerts
    const alerts = await Alert.findAll({
      where: { sensorId: parsedId, enabled: true },
    });

    for (const alert of alerts) {
      const val = datapoint.toJSON().value;
      if (typeof val !== "number") continue;

      let triggered = false;
      switch (alert.condition) {
        case ">": triggered = val > alert.value; break;
        case "<": triggered = val < alert.value; break;
        case ">=": triggered = val >= alert.value; break;
        case "<=": triggered = val <= alert.value; break;
        case "==": triggered = val == alert.value; break;
        case "!=": triggered = val != alert.value; break;
      }
      if (triggered) {
        sseService.sendAlertTriggered(alert, datapoint, sensor);
      }
    }

    res.status(201).json({ data: { datapoint } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid sensor ID" });
    }

    const sensor = await Sensor.findByPk(parsedId);

    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }

    await sensor.destroy();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
