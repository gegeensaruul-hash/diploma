import express from "express";
import { getUsers, toggleUser, deleteUser, updateProfile, updateProfileImages, changePassword } from "../controllers/userController.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", isAdmin, getUsers);
router.put("/profile", updateProfile);
router.put("/profile/images", updateProfileImages);
router.put("/change-password", changePassword);
router.put("/:id/toggle", isAdmin, toggleUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;
