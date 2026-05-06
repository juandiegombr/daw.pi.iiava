import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./models/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(() => console.log("MySQL connected and synced"))
  .catch((err) => console.error("Error connecting to MySQL:", err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});