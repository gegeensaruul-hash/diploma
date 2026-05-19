import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
