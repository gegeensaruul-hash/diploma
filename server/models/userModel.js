import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../utils/connectDB.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "user"), defaultValue: "user" },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      get() {
        const val = this.getDataValue("isActive");
        // null эсвэл undefined байвал true буцаана
        return val === null || val === undefined ? true : Boolean(val);
      },
    },
    avatarImage: { type: DataTypes.TEXT("long"), defaultValue: null },
    coverImage: { type: DataTypes.TEXT("long"), defaultValue: null },
  },
  {
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Шинэ хэрэглэгч үүсгэхэд isActive=true байгааг баталгаажуулна
      beforeCreate: (user) => {
        if (user.isActive === null || user.isActive === undefined) {
          user.isActive = true;
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default User;
