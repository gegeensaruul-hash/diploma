const QPAY_BASE_URL = process.env.QPAY_BASE_URL || "https://merchant.qpay.mn/v2";

const requireConfig = () => {
  const missing = ["QPAY_CLIENT_ID", "QPAY_CLIENT_SECRET", "QPAY_INVOICE_CODE"]
    .filter((key) => !process.env[key]);
  if (missing.length) {
    const err = new Error(`Missing QPay configuration: ${missing.join(", ")}`);
    err.statusCode = 503;
    throw err;
  }
};

const qpayFetch = async (path, options = {}) => {
  const res = await fetch(`${QPAY_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data.message || data.error || `QPay request failed (${res.status})`);
    err.statusCode = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const getQpayToken = async () => {
  requireConfig();
  const basic = Buffer.from(`${process.env.QPAY_CLIENT_ID}:${process.env.QPAY_CLIENT_SECRET}`).toString("base64");
  return qpayFetch("/auth/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
};

export const createQpayInvoice = async (payload) => {
  const token = await getQpayToken();
  return qpayFetch("/invoice", {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}` },
    body: JSON.stringify(payload),
  });
};

export const checkQpayInvoice = async (invoiceId) => {
  const token = await getQpayToken();
  return qpayFetch("/payment/check", {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}` },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });
};
