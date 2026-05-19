import express from "express";
import { chat } from "../controllers/aiController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protectRoute, chat);

export default router;
