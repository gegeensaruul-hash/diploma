import { DataTypes } from "sequelize";
import { sequelize } from "../utils/connectDB.js";

const RoomMember = sequelize.define(
  "RoomMember",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    roomId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("accepted", "pending", "declined"),
      defaultValue: "accepted",
      allowNull: false,
    },
  },
  { timestamps: true }
);

export default RoomMember;
