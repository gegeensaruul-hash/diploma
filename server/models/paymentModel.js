import { DataTypes } from "sequelize";
import { sequelize } from "../utils/connectDB.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false, defaultValue: "qpay" },
    senderInvoiceNo: { type: DataTypes.STRING, allowNull: false, unique: true },
    providerInvoiceId: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    qrText: { type: DataTypes.TEXT, allowNull: true },
    qrImage: { type: DataTypes.TEXT("long"), allowNull: true },
    urls: { type: DataTypes.JSON, allowNull: true },
    providerResponse: { type: DataTypes.JSON, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: true }
);

export default Payment;
