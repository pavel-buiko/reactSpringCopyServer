import express from "express";
import { getCards } from "../controller/projectController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/cards", authenticateToken, getCards);

export default router;
