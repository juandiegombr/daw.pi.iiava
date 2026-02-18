import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./logger.js";
import sensorsRouter from "./router/sensors.js";
import authRouter from "./router/auth.js";
import alertsRouter from "./router/alerts.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.use('/api/sensors', sensorsRouter);
app.use('/api/auth', authRouter);
app.use('/api/alerts', alertsRouter);

export default app;
