import asyncHandler from "express-async-handler";
import { User } from "../models/index.js";

// GET /api/users — Admin: бүх хэрэглэгч
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ["password"] }, order: [["createdAt", "DESC"]] });
  res.json({ status: true, users });
});

// PUT /api/users/:id/toggle
export const toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ status: false, message: "Хэрэглэгч олдсонгүй" });
  await user.update({ isActive: !user.isActive });
  res.json({ status: true, message: user.isActive ? "Идэвхжүүлэгдлээ" : "Хаагдлаа" });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ status: true, message: "Устгагдлаа" });
});

// PUT /api/users/profile — нэр засах
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ status: false, message: "Хэрэглэгч олдсонгүй" });
  const { name } = req.body;
  await user.update({ name: name || user.name });
  const updated = { id: user.id, name: user.name, email: user.email, role: user.role, avatarImage: user.avatarImage, coverImage: user.coverImage };
  res.json({ status: true, message: "Профайл шинэчлэгдлээ", user: updated });
});

// PUT /api/users/profile/images — зураг шинэчлэх
export const updateProfileImages = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) return res.status(404).json({ status: false, message: "Хэрэглэгч олдсонгүй" });
  const { avatarImage, coverImage } = req.body;
  const updates = {};
  if (avatarImage !== undefined) updates.avatarImage = avatarImage; // null = устгах
  if (coverImage !== undefined) updates.coverImage = coverImage;
  await user.update(updates);
  const updated = { id: user.id, name: user.name, email: user.email, role: user.role, avatarImage: user.avatarImage, coverImage: user.coverImage };
  res.json({ status: true, message: "Зураг шинэчлэгдлээ", user: updated });
});

// PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  const { currentPassword, newPassword } = req.body;
  if (!await user.matchPassword(currentPassword))
    return res.status(400).json({ status: false, message: "Одоогийн нууц үг буруу байна" });
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ status: false, message: "Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" });
  user.password = newPassword;
  await user.save();
  res.json({ status: true, message: "Нууц үг солигдлоо" });
});
