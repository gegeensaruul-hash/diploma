import { DataTypes } from "sequelize";
import { sequelize } from "../utils/connectDB.js";

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    roomId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
  },
  { timestamps: true }
);

export default ChatMessage;
