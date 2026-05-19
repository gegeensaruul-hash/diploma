import asyncHandler from "express-async-handler";
import { ChatRoom, ChatMessage, RoomMember, User } from "../models/index.js";

// GET /api/chat/rooms — өөрийн оролцдог room-уудыг авах
export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.findAll({
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "name", "email"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Хэрэглэгч member эсэхийг тэмдэглэх
  const result = rooms.map((room) => {
    const r = room.toJSON();
    r.isMember = r.members.some((m) => m.id === req.user.userId);
    return r;
  });

  res.json({ status: true, rooms: result });
});

// POST /api/chat/rooms — шинэ room үүсгэх
export const createRoom = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ status: false, message: "Нэр оруулна уу" });

  const room = await ChatRoom.create({ name, description, createdBy: req.user.userId });

  // Үүсгэгчийг автоматаар нэмэх
  await RoomMember.create({ roomId: room.id, userId: req.user.userId });

  const full = await ChatRoom.findByPk(room.id, {
    include: [{ model: User, as: "members", attributes: ["id", "name"], through: { attributes: [] } }],
  });

  res.status(201).json({ status: true, room: full });
});

// POST /api/chat/rooms/:id/join — DISABLED: invite-only rooms
export const joinRoom = asyncHandler(async (req, res) => {
  res.status(403).json({ status: false, message: "Энэ room invite-only байна. Admin-аас урилга хүлээнэ үү." });
});

// POST /api/chat/rooms/:id/leave — room-оос гарах
export const leaveRoom = asyncHandler(async (req, res) => {
  await RoomMember.destroy({ where: { roomId: req.params.id, userId: req.user.userId } });
  res.json({ status: true, message: "Room-оос гарлаа" });
});

// DELETE /api/chat/rooms/:id — room устгах (зөвхөн үүсгэгч / admin)
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ status: false, message: "Room олдсонгүй" });

  if (room.createdBy !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({ status: false, message: "Зөвшөөрөл байхгүй" });
  }

  await room.destroy();
  res.json({ status: true, message: "Room устгагдлаа" });
});

// GET /api/chat/rooms/:id/messages — өмнөх мессежүүд
export const getMessages = asyncHandler(async (req, res) => {
  const member = await RoomMember.findOne({ where: { roomId: req.params.id, userId: req.user.userId } });
  if (!member) return res.status(403).json({ status: false, message: "Энэ room-ын member биш байна" });

  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const { count, rows } = await ChatMessage.findAndCountAll({
    where: { roomId: req.params.id },
    include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
    order: [["createdAt", "ASC"]],
    limit,
    offset,
  });

  res.json({ status: true, messages: rows, total: count, page });
});

// POST /api/chat/rooms/:id/add — зөвхөн creator эсвэл admin хэрэглэгч нэмж чадна
export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: false, message: "Имэйл оруулна уу" });

  const room = await ChatRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ status: false, message: "Room олдсонгүй" });

  // Зөвхөн room үүсгэгч эсвэл admin нэмж чадна
  if (room.createdBy !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({ status: false, message: "Зөвхөн room creator эсвэл admin урилга илгээж чадна" });
  }

  const targetUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!targetUser) return res.status(404).json({ status: false, message: "Хэрэглэгч олдсонгүй" });

  const exists = await RoomMember.findOne({ where: { roomId: room.id, userId: targetUser.id } });
  if (exists) return res.status(400).json({ status: false, message: "Аль хэдийн member байна" });

  await RoomMember.create({ roomId: room.id, userId: targetUser.id });
  res.json({ status: true, message: `${targetUser.name} амжилттай нэмэгдлээ ✓` });
});
