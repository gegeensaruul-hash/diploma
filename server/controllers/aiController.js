import Groq from "groq-sdk";
import asyncHandler from "express-async-handler";
import { User } from "../models/index.js";

const FREE_AI_DAILY_LIMIT = 10;

let _groq = null;
const getGroq = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in .env");
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

const SYSTEM_PROMPT = `You are a helpful AI assistant built into a Todo & Productivity app called TodoApp.
You help users manage their tasks, give productivity tips, brainstorm ideas, and assist with anything they need.
Be concise, friendly, and helpful. Use markdown sparingly — only for lists or code if needed.
If the user writes in Mongolian, respond in Mongolian. If in English, respond in English.`;

// POST /api/ai/chat
export const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400);
    throw new Error("Messages array is required");
  }

  const user = await User.findByPk(req.user.userId);

  // Free хэрэглэгчийн өдрийн лимит шалгах
  if (!user.isPro) {
    const today = new Date().toISOString().slice(0, 10);
    if (user.aiMsgDate !== today) {
      await user.update({ aiMsgCount: 0, aiMsgDate: today });
    }
    if (user.aiMsgCount >= FREE_AI_DAILY_LIMIT) {
      return res.status(403).json({
        status: false,
        limited: true,
        message: `Өдрийн ${FREE_AI_DAILY_LIMIT} мессежийн хязгаар дууссан. Pro болж хязгааргүй ашиглаарай!`,
      });
    }
  }

  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const reply = completion.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";

  // Free хэрэглэгчийн тоолуур нэмэх
  if (!user.isPro) {
    await user.increment("aiMsgCount");
  }

  const remaining = user.isPro ? null : FREE_AI_DAILY_LIMIT - (user.aiMsgCount + 1);
  res.json({ reply, remaining });
});
