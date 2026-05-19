import asyncHandler from "express-async-handler";
import { Category } from "../models/index.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ where: { userId: req.user.userId }, order: [["createdAt", "ASC"]] });
  res.json({ status: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ status: false, message: "Нэр шаардлагатай" });
  const category = await Category.create({ name, color: color || "#3b82f6", userId: req.user.userId });
  res.status(201).json({ status: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!cat) return res.status(404).json({ status: false, message: "Категори олдсонгүй" });
  await cat.update(req.body);
  res.json({ status: true, category: cat });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!cat) return res.status(404).json({ status: false, message: "Категори олдсонгүй" });
  await cat.destroy();
  res.json({ status: true, message: "Устгагдлаа" });
});
