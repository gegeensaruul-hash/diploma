import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getRooms, createRoom, joinRoom, leaveRoom, deleteRoom, getMessages } from "../controllers/chatController.js";

const router = express.Router();

router.use(protectRoute);

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.post("/rooms/:id/join", joinRoom);
router.post("/rooms/:id/leave", leaveRoom);
router.delete("/rooms/:id", deleteRoom);
router.get("/rooms/:id/messages", getMessages);

export default router;
