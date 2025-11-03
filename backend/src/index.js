import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/fields", async (req, res) => {
  res.json({ data: {
    fields: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  } });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

/* eslint-disable */ console.log('process.env', process.env)

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error conectando a Mongo:", err));

app.listen(PORT, () => console.log(`🚀 Backend corriendo en puerto ${PORT}`));