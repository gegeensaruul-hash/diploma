import express from "express";
import {
  getTodos, getTodo, createTodo, updateTodo,
  updateStatus, trashTodo, restoreTodo, deleteTodo,
  getTrashed, getStats,
} from "../controllers/todoController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { validateTodo } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/stats", getStats);
router.get("/trash", getTrashed);
router.get("/", getTodos);
router.get("/:id", getTodo);
router.post("/", validateTodo, createTodo);
router.put("/:id", validateTodo, updateTodo);
router.patch("/:id/status", updateStatus);
router.patch("/:id/trash", trashTodo);
router.patch("/:id/restore", restoreTodo);
router.delete("/:id", deleteTodo);

export default router;
