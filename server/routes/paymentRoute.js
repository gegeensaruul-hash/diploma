import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { listPayments, createInvoice, checkInvoice, qpayCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/qpay/callback", qpayCallback);
router.get("/qpay/callback", qpayCallback);

router.use(protectRoute);
router.get("/", listPayments);
router.post("/qpay/invoice", createInvoice);
router.post("/qpay/check/:id", checkInvoice);

export default router;
