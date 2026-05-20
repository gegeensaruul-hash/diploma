import asyncHandler from "express-async-handler";
import { ChatRoom, ChatMessage, RoomMember, User } from "../models/index.js";
import { Op } from "sequelize";

// GET /api/chat/rooms — өөрийн оролцдог room-уудыг авах
export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.findAll({
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "name", "email"],
        through: { attributes: ["status"] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Хэрэглэгч member эсэхийг тэмдэглэх
  const result = rooms.map((room) => {
    const r = room.toJSON();
    const myMembership = r.members.find((m) => m.id === req.user.userId);
    const memberStatus = myMembership?.RoomMember?.status;
    r.isMember = memberStatus === "accepted" || (myMembership && !memberStatus);
    return r;
  });

  res.json({ status: true, rooms: result });
});

// POST /api/chat/rooms — шинэ room үүсгэх
export const createRoom = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ status: false, message: "Нэр оруулна уу" });

  const room = await ChatRoom.create({ name, description, createdBy: req.user.userId });

  // Үүсгэгчийг автоматаар нэмэх (accepted)
  await RoomMember.create({ roomId: room.id, userId: req.user.userId, status: "accepted" });

  const full = await ChatRoom.findByPk(room.id, {
    include: [{ model: User, as: "members", attributes: ["id", "name"], through: { attributes: ["status"] } }],
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
  const member = await RoomMember.findOne({
    where: { roomId: req.params.id, userId: req.user.userId, status: { [Op.or]: ["accepted", null] } },
  });
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

// POST /api/chat/rooms/:id/add — invite илгээх (pending status)
export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: false, message: "Имэйл оруулна уу" });

  const room = await ChatRoom.findByPk(req.params.id);
  if (!room) return res.status(404).json({ status: false, message: "Room олдсонгүй" });

  if (room.createdBy !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({ status: false, message: "Зөвхөн room creator эсвэл admin урилга илгээж чадна" });
  }

  const targetUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!targetUser) return res.status(404).json({ status: false, message: "Хэрэглэгч олдсонгүй" });

  const exists = await RoomMember.findOne({ where: { roomId: room.id, userId: targetUser.id } });
  if (exists) {
    if (exists.status === "accepted") return res.status(400).json({ status: false, message: "Аль хэдийн member байна" });
    if (exists.status === "pending") return res.status(400).json({ status: false, message: "Урилга аль хэдийн илгээсэн байна" });
    // declined -> resend invite
    await exists.update({ status: "pending" });
    return res.json({ status: true, message: `${targetUser.name}-д урилга дахин илгээгдлээ` });
  }

  await RoomMember.create({ roomId: room.id, userId: targetUser.id, status: "pending" });
  res.json({ status: true, message: `${targetUser.name}-д урилга илгээгдлээ` });
});

// GET /api/chat/invites — миний хүлээгдэж буй урилгууд
export const getInvites = asyncHandler(async (req, res) => {
  const invites = await RoomMember.findAll({
    where: { userId: req.user.userId, status: "pending" },
    include: [
      {
        model: ChatRoom,
        attributes: ["id", "name", "description", "createdBy"],
        include: [{ model: User, as: "members", attributes: ["id", "name"], through: { attributes: [] } }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({ status: true, invites });
});

// POST /api/chat/invites/:id/accept — урилга зөвшөөрөх
export const acceptInvite = asyncHandler(async (req, res) => {
  const invite = await RoomMember.findOne({
    where: { id: req.params.id, userId: req.user.userId, status: "pending" },
  });
  if (!invite) return res.status(404).json({ status: false, message: "Урилга олдсонгүй" });

  await invite.update({ status: "accepted" });
  res.json({ status: true, message: "Урилга зөвшөөрөгдлөө!" });
});

// POST /api/chat/invites/:id/decline — урилга татгалзах
export const declineInvite = asyncHandler(async (req, res) => {
  const invite = await RoomMember.findOne({
    where: { id: req.params.id, userId: req.user.userId, status: "pending" },
  });
  if (!invite) return res.status(404).json({ status: false, message: "Урилга олдсонгүй" });

  await invite.update({ status: "declined" });
  res.json({ status: true, message: "Урилга татгалзлаа" });
});
