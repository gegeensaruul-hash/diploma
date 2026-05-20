import cors from "cors";
import cookieParser from "cookie-parser";
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
    // MySQL uses Users, Postgres might need "Users" or users
    await sequelize.query('UPDATE "Users" SET "isActive" = true WHERE "isActive" IS NULL').catch(() => 
      sequelize.query('UPDATE Users SET isActive = 1 WHERE isActive IS NULL')
    );
    console.log("✅ User isActive values ensured");
  } catch (err) {
    console.log("ℹ️ isActive fix skipped:", err.message);
  }

  // RoomMember status=NULL бичлэгүүдийг accepted болгох
  try {
    await sequelize.query('UPDATE "RoomMembers" SET "status" = \'accepted\' WHERE "status" IS NULL').catch(() =>
      sequelize.query("UPDATE RoomMembers SET status = 'accepted' WHERE status IS NULL")
    );
    console.log("✅ RoomMember status values ensured");
  } catch (err) {
    console.log("ℹ️ RoomMember fix skipped:", err.message);
  }

  const app = express();
  const httpServer = createServer(app);
  const port = process.env.PORT || 5000;

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow all origins in dev, or specific ones in prod
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }));

  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use("/api", apiLimiter);
  app.use("/api", routes);
  app.use(routeNotFound);
  app.use(errorHandler);

  // Socket.io auth middleware — supports both cookie and token auth
  io.use((socket, next) => {
    try {
      // Try token from handshake auth first, then fall back to cookie
      let token = socket.handshake.auth?.token || null;
      if (!token) {
        const cookieHeader = socket.handshake.headers?.cookie || "";
        const match = cookieHeader.match(/(?:^|; )token=([^;]*)/);
        token = match ? match[1] : null;
      }

      if (!token) {
        console.log("❌ Socket Auth: No token found");
        return next(new Error("Authentication error: Login required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.log("❌ Socket Auth: Invalid token", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Socket.io events
  io.on("connection", (socket) => {
    console.log(`💬 User ${socket.userId} connected`);

    socket.on("join_room", async (roomId) => {
      const member = await RoomMember.findOne({ where: { roomId, userId: socket.userId, status: ["accepted", null] } });
      if (!member) return socket.emit("chat_error", "Та энэ room-ын member биш байна");
      socket.join(`room_${roomId}`);
      socket.emit("joined_room", roomId);
    });

    socket.on("leave_room", (roomId) => socket.leave(`room_${roomId}`));

    socket.on("send_message", async ({ roomId, message }) => {
      if (!message?.trim()) return;
      const member = await RoomMember.findOne({ where: { roomId, userId: socket.userId, status: ["accepted", null] } });
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
