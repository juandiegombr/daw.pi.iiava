import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import pinoHttp from "pino-http";
import { logger } from "./logger.js";
import sensorsRouter from "./router/sensors.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error conectando a Mongo:", err));

app.use('/api/sensors', sensorsRouter);

app.listen(PORT, () => console.log(`🚀 Backend corriendo en puerto ${PORT}`));
