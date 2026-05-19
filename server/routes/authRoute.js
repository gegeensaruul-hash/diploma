import express from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin } from "../middleware/validationMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);

export default router;
