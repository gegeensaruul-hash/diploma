const store = new Map();

const limiter = ({ windowMs = 60000, max = 100, message = "Хэт олон хүсэлт. Түр хүлээнэ үү." } = {}) =>
  (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const data = store.get(key);
    if (!data || now > data.reset) {
      store.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    if (data.count >= max)
      return res.status(429).json({ status: false, message });
    data.count++;
    next();
  };

export const authLimiter = limiter({ windowMs: 60000, max: 10, message: "Хэт олон оролдлого. 1 минутын дараа дахин оролдоно уу." });
export const apiLimiter = limiter({ windowMs: 60000, max: 100 });
