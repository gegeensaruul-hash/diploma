import asyncHandler from "express-async-handler";
import { Payment, User } from "../models/index.js";
import { createQpayInvoice, checkQpayInvoice } from "../utils/qpayClient.js";

const toNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const hasPaidPayment = (result) => {
  const rows = result?.rows || result?.payments || result?.data || [];
  if (Array.isArray(rows) && rows.some((row) => Number(row.payment_status === "PAID" || row.status === "PAID" || row.paid_amount > 0))) {
    return true;
  }
  return Number(result?.paid_amount || result?.total_paid_amount || 0) > 0;
};

export const listPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.findAll({
    where: { userId: req.user.userId },
    order: [["createdAt", "DESC"]],
    limit: 25,
  });
  res.json({ status: true, payments });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const amount = toNumber(req.body.amount);
  const description = String(req.body.description || "App payment").trim().slice(0, 180);

  if (amount <= 0) {
    return res.status(400).json({ status: false, message: "Amount must be greater than 0" });
  }

  const senderInvoiceNo = `${req.user.userId}-${Date.now()}`;
  const callbackBase = process.env.QPAY_CALLBACK_URL || `${req.protocol}://${req.get("host")}/api/payments/qpay/callback`;
  const callbackUrl = `${callbackBase}${callbackBase.includes("?") ? "&" : "?"}invoice=${encodeURIComponent(senderInvoiceNo)}`;

  const invoice = await createQpayInvoice({
    invoice_code: process.env.QPAY_INVOICE_CODE,
    sender_invoice_no: senderInvoiceNo,
    invoice_receiver_code: process.env.QPAY_RECEIVER_CODE || "terminal",
    sender_branch_code: process.env.QPAY_BRANCH_CODE || "online",
    invoice_description: description,
    amount,
    callback_url: callbackUrl,
  });

  const payment = await Payment.create({
    userId: req.user.userId,
    senderInvoiceNo,
    amount,
    description,
    providerInvoiceId: invoice.invoice_id || invoice.id || null,
    qrText: invoice.qr_text || null,
    qrImage: invoice.qr_image || null,
    urls: invoice.urls || null,
    providerResponse: invoice,
  });

  res.status(201).json({ status: true, payment });
});

export const checkInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!payment) return res.status(404).json({ status: false, message: "Payment not found" });
  if (!payment.providerInvoiceId) return res.status(400).json({ status: false, message: "Missing QPay invoice id" });

  const result = await checkQpayInvoice(payment.providerInvoiceId);
  const paid = hasPaidPayment(result);
  await payment.update({
    status: paid ? "paid" : payment.status,
    paidAt: paid && !payment.paidAt ? new Date() : payment.paidAt,
    providerResponse: { ...(payment.providerResponse || {}), lastCheck: result },
  });

  if (paid) {
    await User.update({ isPro: true }, { where: { id: req.user.userId } });
  }

  res.json({ status: true, paid, payment, qpay: result });
});

export const mockPay = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!payment) return res.status(404).json({ status: false, message: "Payment not found" });

  await payment.update({
    status: "paid",
    paidAt: new Date(),
    providerResponse: { ...(payment.providerResponse || {}), mockPayment: true },
  });

  await User.update({ isPro: true }, { where: { id: req.user.userId } });

  res.json({ status: true, paid: true, payment });
});

export const qpayCallback = asyncHandler(async (req, res) => {
  const senderInvoiceNo = req.query.invoice || req.body?.invoice;
  if (senderInvoiceNo) {
    const payment = await Payment.findOne({ where: { senderInvoiceNo } });
    if (payment) {
      await payment.update({
        providerResponse: { ...(payment.providerResponse || {}), callback: { query: req.query, body: req.body } },
      });
    }
  }
  res.json({ status: true });
});
