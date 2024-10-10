import express from "express";
import cors from "cors";
import authRoutes from "./route/authRoutes.js";
import projectRoutes from "./route/projectRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

const app = express();

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

export default app;
