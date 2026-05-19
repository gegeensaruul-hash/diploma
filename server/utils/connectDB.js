import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Neon (PostgreSQL) uses DATABASE_URL; local dev uses individual MySQL vars
const isPostgres = !!process.env.DATABASE_URL;

export const sequelize = isPostgres
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      logging: false,
    })
  : new Sequelize(
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
    console.log(`✅ ${isPostgres ? "PostgreSQL (Neon)" : "MySQL"} connected & tables synced`);
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

export default dbConnection;
