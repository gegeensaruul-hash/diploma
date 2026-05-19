import express from "express";
import authRoute from "./authRoute.js";
import todoRoute from "./todoRoute.js";
import categoryRoute from "./categoryRoute.js";
import userRoute from "./userRoute.js";
import chatRoute from "./chatRoute.js";
import capsuleRoute from "./capsuleRoute.js";
import aiRoute from "./aiRoute.js";
import paymentRoute from "./paymentRoute.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/todos", todoRoute);
router.use("/categories", categoryRoute);
router.use("/users", userRoute);
router.use("/chat", chatRoute);
router.use("/capsule", capsuleRoute);
router.use("/ai", aiRoute);
router.use("/payments", paymentRoute);

export default router;
