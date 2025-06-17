import express from "express";
import { register, login } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/register",authLimiter, register);
router.post("/login",authLimiter, login);

export default router;
