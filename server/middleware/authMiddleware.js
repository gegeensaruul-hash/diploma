import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const protectRoute = asyncHandler(async (req, res, next) => {
  // Accept token from Authorization header or cookie
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ status: false, message: "Нэвтрэх шаардлагатай" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: ["id", "name", "email", "role", "isActive"],
    });

    if (!user) {
      // Token хүчинтэй боловч DB-д хэрэглэгч байхгүй — token цэвэрлэнэ
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", "", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "strict", expires: new Date(0) });
      return res.status(401).json({ status: false, message: "Сесс дууссан байна. Дахин нэвтэрнэ үү." });
    }

    // isActive-г шалгана (зөвхөн тодорхой false байвал)
    const active = user.getDataValue ? user.getDataValue("isActive") : user.isActive;
    if (active === false || active === 0) {
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", "", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "strict", expires: new Date(0) });
      return res.status(401).json({ status: false, message: "Хэрэглэгчийн эрх хаагдсан байна" });
    }

    req.user = { userId: user.id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (err) {
    // Token хүчингүй эсвэл хугацаа дууссан
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", "", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "strict", expires: new Date(0) });
    return res.status(401).json({ status: false, message: "Сесс дууссан байна. Дахин нэвтэрнэ үү." });
  }
});

export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ status: false, message: "Admin эрх шаардлагатай" });
};
