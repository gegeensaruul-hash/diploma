import { DataTypes } from "sequelize";
import { sequelize } from "../utils/connectDB.js";

const Todo = sequelize.define(
  "Todo",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    status: {
      type: DataTypes.ENUM("todo", "in_progress", "completed"),
      defaultValue: "todo",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    dueDate: { type: DataTypes.DATEONLY, allowNull: true },
    isTrashed: { type: DataTypes.BOOLEAN, defaultValue: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { timestamps: true }
);

export default Todo;
