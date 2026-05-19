import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";
import "./models/index.js";
import { ChatMessage, RoomMember, User } from "./models/index.js";
import { sequelize } from "./utils/connectDB.js";

dotenv.config();

const startServer = async () => {
  await dbConnection();

  // isActive=NULL байгаа хэрэглэгчдийг автоматаар засна
  try {
    await sequelize.query("UPDATE Users SET isActive = 1 WHERE isActive IS NULL");
    console.log("✅ User isActive values ensured");
  } catch (err) {
    console.log("ℹ️ isActive fix skipped:", err.message);
  }

  const app = express();
  const httpServer = createServer(app);
  const port = process.env.PORT || 5000;

  const corsOptions = {
    origin: true, // reflect request origin — works with credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  app.options("*", cors(corsOptions)); // preflight FIRST
  app.use(cors(corsOptions));

  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use("/api", apiLimiter);
  app.use("/api", routes);
  app.use(routeNotFound);
  app.use(errorHandler);

  // Socket.io auth middleware
  io.use((socket, next) => {
    const cookie = socket.handshake.headers?.cookie || "";
    const token = cookie.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];
    if (!token) return next(new Error("Нэвтрэх шаардлагатай"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Token хүчингүй"));
    }
  });

  // Socket.io events
  io.on("connection", (socket) => {
    console.log(`💬 User ${socket.userId} connected`);

    socket.on("join_room", async (roomId) => {
      const member = await RoomMember.findOne({ where: { roomId, userId: socket.userId } });
      if (!member) return socket.emit("chat_error", "Та энэ room-ын member биш байна");
      socket.join(`room_${roomId}`);
      socket.emit("joined_room", roomId);
    });

    socket.on("leave_room", (roomId) => socket.leave(`room_${roomId}`));

    socket.on("send_message", async ({ roomId, message }) => {
      if (!message?.trim()) return;
      const member = await RoomMember.findOne({ where: { roomId, userId: socket.userId } });
      if (!member) return socket.emit("chat_error", "Зөвшөөрөл байхгүй");
      const saved = await ChatMessage.create({ roomId, userId: socket.userId, message: message.trim() });
      const full = await ChatMessage.findByPk(saved.id, {
        include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
      });
      io.to(`room_${roomId}`).emit("new_message", full);
    });

    socket.on("disconnect", () => console.log(`💬 User ${socket.userId} disconnected`));
  });

  httpServer.listen(port, () => console.log(`🚀 Server running on port ${port}`));
};

startServer();
