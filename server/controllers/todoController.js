import asyncHandler from "express-async-handler";
import { Op } from "sequelize";
import { Todo, Category } from "../models/index.js";

// GET /api/todos — жагсаалт (search, filter, pagination)
export const getTodos = asyncHandler(async (req, res) => {
  const { search, status, priority, categoryId, page = 1, limit = 10 } = req.query;
  const where = { userId: req.user.userId, isTrashed: false };

  if (search) where.title = { [Op.like]: `%${search}%` };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (categoryId) where.categoryId = categoryId;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Todo.findAndCountAll({
    where,
    include: [{ model: Category, as: "category", attributes: ["id", "name", "color"] }],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.json({
    status: true,
    todos: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / parseInt(limit)),
  });
});

// GET /api/todos/stats
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const [todo, in_progress, completed, total] = await Promise.all([
    Todo.count({ where: { userId, status: "todo", isTrashed: false } }),
    Todo.count({ where: { userId, status: "in_progress", isTrashed: false } }),
    Todo.count({ where: { userId, status: "completed", isTrashed: false } }),
    Todo.count({ where: { userId, isTrashed: false } }),
  ]);
  res.json({ status: true, stats: { todo, in_progress, completed, total } });
});

// GET /api/todos/trash
export const getTrashed = asyncHandler(async (req, res) => {
  const todos = await Todo.findAll({
    where: { userId: req.user.userId, isTrashed: true },
    order: [["updatedAt", "DESC"]],
  });
  res.json({ status: true, todos });
});

// GET /api/todos/:id
export const getTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({
    where: { id: req.params.id, userId: req.user.userId },
    include: [{ model: Category, as: "category", attributes: ["id", "name", "color"] }],
  });
  if (!todo) return res.status(404).json({ status: false, message: "Todo олдсонгүй" });
  res.json({ status: true, todo });
});

// POST /api/todos
export const createTodo = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, categoryId } = req.body;
  const todo = await Todo.create({
    title, description, status, priority, dueDate, categoryId: categoryId || null,
    userId: req.user.userId,
  });
  res.status(201).json({ status: true, todo, message: "Todo амжилттай үүслээ" });
});

// PUT /api/todos/:id
export const updateTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!todo) return res.status(404).json({ status: false, message: "Todo олдсонгүй" });

  const { title, description, status, priority, dueDate, categoryId } = req.body;
  await todo.update({ title, description, status, priority, dueDate, categoryId: categoryId || null });
  res.json({ status: true, todo, message: "Todo шинэчлэгдлээ" });
});

// PATCH /api/todos/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!todo) return res.status(404).json({ status: false, message: "Todo олдсонгүй" });
  await todo.update({ status: req.body.status });
  res.json({ status: true, todo, message: "Статус шинэчлэгдлээ" });
});

// DELETE /api/todos/:id/trash — trash руу шилжүүлэх
export const trashTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!todo) return res.status(404).json({ status: false, message: "Todo олдсонгүй" });
  await todo.update({ isTrashed: true });
  res.json({ status: true, message: "Trash руу шилжлээ" });
});

// PATCH /api/todos/:id/restore — сэргээх
export const restoreTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!todo) return res.status(404).json({ status: false, message: "Todo олдсонгүй" });
  await todo.update({ isTrashed: false });
  res.json({ status: true, message: "Сэргээгдлээ" });
});

// DELETE /api/todos/:id — бүрмөсөн устгах
export const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.userId } });
  if (!todo) return res.status(404).json({ status: false, message: "Todo олдсонгүй" });
  await todo.destroy();
  res.json({ status: true, message: "Устгагдлаа" });
});
