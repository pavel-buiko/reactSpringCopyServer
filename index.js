import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postgres from "./db.js";

import authRoutes from "./route/authRoutes.js";
import projectRoutes from "./route/projectRoutes.js";

const port = process.env.PORT ?? 5000;

(async function connectToDatabase() {
  try {
    await postgres.raw("SELECT 1+1 AS result");
    console.log("Successful connection to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
})();

dotenv.config();

const app = express();
app.listen(port, () => console.log(`Server is running on port: ${port}`));

app.use(cors());
app.use(express.json());
app.use("/img", express.static("./img"));

app.get("/api/test", (_, res) => {
  res.json({ message: "Server is connected to frontend" });
});

app.use("/api", authRoutes);
app.use("/api", projectRoutes);

app.use((err, req, res, next) => {
  console.error("Ошибка:", err);
  res.status(500).json({ message: "Internal server error" });
});
