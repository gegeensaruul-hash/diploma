import asyncHandler from "express-async-handler";
import { User } from "../models/index.js";
import createJWT from "../utils/jwt.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ status: false, message: "И-мэйл аль хэдийн бүртгэлтэй байна" });

  // isActive: true-г тодорхой оруулна
  const user = await User.create({ name, email, password, role: "user", isActive: true });
  user.password = undefined;
  res.status(201).json({ status: true, message: "Бүртгэл амжилттай үүслээ" });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ status: false, message: "И-мэйл эсвэл нууц үг буруу байна" });
  if (user.isActive === false) return res.status(401).json({ status: false, message: "Хэрэглэгчийн эрх хаагдсан байна" });

  const match = await user.matchPassword(password);
  if (!match) return res.status(401).json({ status: false, message: "И-мэйл эсвэл нууц үг буруу байна" });

  createJWT(res, user.id);
  user.password = undefined;
  res.json({ status: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export const logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ status: true, message: "Амжилттай гарлаа" });
};

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId, {
    attributes: ["id", "name", "email", "role"],
  });
  res.json({ status: true, user });
});
