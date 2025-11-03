import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

const FarmerSchema = new mongoose.Schema({
  name: String,
  email: String,
}, { collection: "farmer" });

const Farmer = mongoose.model("Farmer", FarmerSchema);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/fields", async (req, res) => {
  const farmers = await Farmer.find();
  res.json({ data: { farmers } });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error conectando a Mongo:", err));

app.listen(PORT, () => console.log(`🚀 Backend corriendo en puerto ${PORT}`));
