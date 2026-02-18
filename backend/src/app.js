import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./logger.js";
import sensorsRouter from "./router/sensors.js";
import alertsRouter from "./router/alerts.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/api/sensors', sensorsRouter);
app.use('/api/alerts', alertsRouter);

export default app;
