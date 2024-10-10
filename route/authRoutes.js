import express from "express";
import { login, refreshToken, signup } from "../controller/authController.js";
import { validateSignup } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/token", refreshToken);
router.post("/signup", validateSignup, signup);

export default router;
