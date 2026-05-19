import express from "express";
import nodemailer from "nodemailer";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-email", protectRoute, async (req, res) => {
  const { to, subject, title, text, mood, createdAt } = req.body;

  if (!to || !text) {
    return res.status(400).json({ message: "Email хаяг эсвэл агуулга байхгүй байна" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f8f7ff; margin:0; padding:20px; }
          .card { max-width:520px; margin:0 auto; background:white; border-radius:20px;
            overflow:hidden; box-shadow:0 8px 40px rgba(124,58,237,0.12); }
          .header { background:linear-gradient(135deg,#7c3aed,#db2777); padding:32px;
            text-align:center; color:white; }
          .header h1 { margin:0 0 8px; font-size:24px; }
          .header p { margin:0; opacity:0.85; font-size:14px; }
          .body { padding:32px; }
          .mood { font-size:40px; text-align:center; margin-bottom:16px; }
          .title { font-size:20px; font-weight:700; color:#1e293b; margin-bottom:8px; text-align:center; }
          .date { font-size:12px; color:#94a3b8; text-align:center; margin-bottom:24px; }
          .content { background:#faf5ff; border-radius:14px; padding:20px;
            font-size:15px; color:#1e293b; line-height:1.8; white-space:pre-wrap;
            font-style:italic; border-left:4px solid #7c3aed; }
          .footer { padding:20px 32px; text-align:center; color:#94a3b8; font-size:12px;
            border-top:1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>💌 Future Capsule</h1>
            <p>Таны ирээдүйд хадгалсан захидал нээгдлээ</p>
          </div>
          <div class="body">
            <div class="mood">${mood}</div>
            <div class="title">${title}</div>
            <div class="date">Бичсэн огноо: ${createdAt}</div>
            <div class="content">${text}</div>
          </div>
          <div class="footer">
            Энэ захидлыг таны өөрийн TodoApp-д хадгалсан Future Capsule илгээсэн.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Future Capsule 💌" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    res.json({ success: true, message: "Email амжилттай илгээгдлээ" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Email илгээхэд алдаа гарлаа", error: err.message });
  }
});

export default router;
