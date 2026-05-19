import { DataTypes } from "sequelize";
import { sequelize } from "../utils/connectDB.js";

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, defaultValue: "#3b82f6" },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

export default Category;
