import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ MySQL connected & tables synced");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

export default dbConnection;
