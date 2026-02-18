import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

import { sequelize, Sensor, DataPoint, Alert } from "../src/models/index.js";

const sampleSensors = [
  {
    alias: "Motor 1 Temperature Sensor",
    type: "float",
  },
  {
    alias: "Hydraulic Pressure Sensor",
    type: "int",
  },
  {
    alias: "Main Valve Status",
    type: "boolean",
  },
  {
    alias: "Shaft A Vibration Sensor",
    type: "float",
  },
  {
    alias: "Cycle Counter",
    type: "int",
  },
  {
    alias: "Oil Level Sensor",
    type: "float",
  },
  {
    alias: "Safety Status",
    type: "boolean",
  },
  {
    alias: "Current Error Code",
    type: "string",
  },
  {
    alias: "Motor 2 RPM Sensor",
    type: "int",
  },
  {
    alias: "Ambient Temperature",
    type: "float",
  },
];

// Helper function to generate realistic datapoints for each sensor type
function generateDataPoints(sensors) {
  const datapoints = [];
  const now = new Date();
  const hoursToGenerate = 24; // Generate data for the last 24 hours
  const pointsPerHour = 12; // One reading every 5 minutes

  sensors.forEach((sensor) => {
    for (let hour = 0; hour < hoursToGenerate; hour++) {
      for (let point = 0; point < pointsPerHour; point++) {
        const minutesAgo = hour * 60 + point * 5;
        const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
        let value;

        // Generate realistic values based on sensor type and alias
        switch (sensor.alias) {
          case "Motor 1 Temperature Sensor":
            // Temperature: 75-85 C with some variation
            value = 75 + Math.random() * 10 + Math.sin(hour / 6) * 3;
            value = parseFloat(value.toFixed(2));
            break;

          case "Hydraulic Pressure Sensor":
            // Pressure: 150-180 bar
            value = Math.floor(150 + Math.random() * 30);
            break;

          case "Main Valve Status":
            // Boolean: mostly open (true), occasionally closed
            value = Math.random() > 0.15;
            break;

          case "Shaft A Vibration Sensor":
            // Vibration: 0.1-0.5 mm/s
            value = 0.1 + Math.random() * 0.4;
            value = parseFloat(value.toFixed(3));
            break;

          case "Cycle Counter":
            // Incrementing counter
            value = Math.floor((hoursToGenerate - hour) * pointsPerHour + (pointsPerHour - point));
            break;

          case "Oil Level Sensor":
            // Oil level: 0.75-1.0 (percentage)
            value = 0.75 + Math.random() * 0.25;
            value = parseFloat(value.toFixed(3));
            break;

          case "Safety Status":
            // Boolean: almost always safe (true)
            value = Math.random() > 0.05;
            break;

          case "Current Error Code":
            // String: mostly "OK", occasionally error codes
            const random = Math.random();
            if (random > 0.9) value = "E001";
            else if (random > 0.85) value = "W002";
            else value = "OK";
            break;

          case "Motor 2 RPM Sensor":
            // RPM: 1400-1600
            value = Math.floor(1400 + Math.random() * 200);
            break;

          case "Ambient Temperature":
            // Temperature: 20-25 C
            value = 20 + Math.random() * 5 + Math.sin(hour / 12 * Math.PI) * 2;
            value = parseFloat(value.toFixed(2));
            break;

          default:
            value = 0;
        }

        // Use type-specific value columns
        const valueFields = DataPoint.setValueByType(sensor.type, value);

        datapoints.push({
          sensorId: sensor.id,
          ...valueFields,
          timestamp,
        });
      }
    }
  });

  return datapoints;
}

async function seed() {
  try {
    console.log("Connecting to MySQL...");
    await sequelize.sync();
    console.log("Connected to MySQL");

    // Clear existing data (respect foreign key order)
    console.log("Clearing existing data...");
    await Alert.destroy({ where: {} });
    await DataPoint.destroy({ where: {} });
    await Sensor.destroy({ where: {} });
    console.log("Existing data deleted");

    // Insert sample sensors
    console.log("Inserting sample sensors...");
    const sensors = await Sensor.bulkCreate(sampleSensors);
    console.log(`${sensors.length} sensors inserted successfully`);

    // Display inserted sensors
    console.log("\nInserted sensors:");
    sensors.forEach((sensor, index) => {
      console.log(`  ${index + 1}. ${sensor.alias} (${sensor.type})`);
    });

    // Generate and insert datapoints
    console.log("\nGenerating and inserting datapoints...");
    const datapoints = generateDataPoints(sensors);
    await DataPoint.bulkCreate(datapoints);
    console.log(`${datapoints.length} datapoints inserted successfully`);
    console.log(`   ${datapoints.length / sensors.length} datapoints per sensor (24 hours, 5-min intervals)`);

    // Create sample alerts
    console.log("\nCreating sample alerts...");
    const sampleAlerts = [
      { sensorId: sensors[0].id, condition: ">", value: 82, description: "Motor 1 temperature too high" },
      { sensorId: sensors[1].id, condition: ">", value: 170, description: "Hydraulic pressure warning" },
      { sensorId: sensors[3].id, condition: ">", value: 0.4, description: "Excessive vibration detected" },
    ];
    await Alert.bulkCreate(sampleAlerts);
    console.log(`${sampleAlerts.length} alerts created`);

    console.log("\nSeed completed successfully!");
  } catch (error) {
    console.error("Error during seed:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("Connection closed");
    process.exit(0);
  }
}

seed();
