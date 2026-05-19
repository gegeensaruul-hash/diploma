/**
 * Энэ скриптийг нэг удаа ажиллуулж isActive=NULL байгаа хэрэглэгчдийг засна.
 * Серверийн index.js-д startup-д нэмж болно эсвэл ганцаараа ажиллуулж болно.
 */
import { sequelize } from "./connectDB.js";

export const fixInactiveUsers = async () => {
  try {
    await sequelize.query(
      "UPDATE Users SET isActive = 1 WHERE isActive IS NULL OR isActive = 0 AND role != 'disabled'"
    );
    console.log("✅ User isActive values fixed");
  } catch (err) {
    console.log("ℹ️ fixInactiveUsers skipped:", err.message);
  }
};
