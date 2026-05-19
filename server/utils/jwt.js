import jwt from "jsonwebtoken";

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    // cross-domain (Vercel frontend ↔ Render backend) requires "none" + secure
    sameSite: isProd ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export default createJWT;
