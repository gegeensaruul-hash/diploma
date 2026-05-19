import { DataTypes } from "sequelize";
import { sequelize } from "../utils/connectDB.js";

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, defaultValue: "" },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

export default ChatRoom;
