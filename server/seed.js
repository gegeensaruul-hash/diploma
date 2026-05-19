/**
 * Seed Script — Demo data for the App
 * Run: node seed.js
 *
 * Creates:
 *  - 2 demo users (admin + regular)
 *  - 4 categories per user
 *  - 15 todos spread across categories & statuses
 */

import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./utils/connectDB.js";
import "./models/index.js"; // load associations
import { User, Category, Todo } from "./models/index.js";

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ DB connected");

    // ── Clear existing seed data (by email) ──────────────────────
    const emails = ["admin@demo.com", "user@demo.com"];
    const existing = await User.findAll({ where: { email: emails } });
    const existingIds = existing.map((u) => u.id);
    if (existingIds.length) {
      await Todo.destroy({ where: { userId: existingIds } });
      await Category.destroy({ where: { userId: existingIds } });
      await User.destroy({ where: { id: existingIds } });
      console.log("🗑  Cleared old seed data");
    }

    // ── Users ────────────────────────────────────────────────────
    const admin = await User.create({
      name: "Admin Demo",
      email: "admin@demo.com",
      password: "demo1234",
      role: "admin",
      isActive: true,
    });

    const demoUser = await User.create({
      name: "Demo User",
      email: "user@demo.com",
      password: "demo1234",
      role: "user",
      isActive: true,
    });

    console.log("👤 Users created");

    // ── Categories ───────────────────────────────────────────────
    const adminCats = await Category.bulkCreate([
      { name: "Work",      color: "#6366f1", userId: admin.id },
      { name: "Personal",  color: "#84cc16", userId: admin.id },
      { name: "Health",    color: "#f43f5e", userId: admin.id },
      { name: "Learning",  color: "#f59e0b", userId: admin.id },
    ]);

    const userCats = await Category.bulkCreate([
      { name: "Work",      color: "#6366f1", userId: demoUser.id },
      { name: "Personal",  color: "#84cc16", userId: demoUser.id },
      { name: "Finance",   color: "#10b981", userId: demoUser.id },
      { name: "Study",     color: "#f59e0b", userId: demoUser.id },
    ]);

    console.log("📂 Categories created");

    // ── Todos for Admin ──────────────────────────────────────────
    const today = new Date();
    const addDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0, 10);
    };

    await Todo.bulkCreate([
      {
        title: "Review Q2 product roadmap",
        description: "Go through the product roadmap and provide feedback to the team.",
        status: "in_progress",
        priority: "high",
        dueDate: addDays(1),
        userId: admin.id,
        categoryId: adminCats[0].id,
      },
      {
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated deployment to Render.",
        status: "todo",
        priority: "high",
        dueDate: addDays(3),
        userId: admin.id,
        categoryId: adminCats[0].id,
      },
      {
        title: "Weekly team standup",
        description: "Prepare talking points and progress updates for the team meeting.",
        status: "completed",
        priority: "medium",
        dueDate: addDays(-1),
        userId: admin.id,
        categoryId: adminCats[0].id,
      },
      {
        title: "Read 'Atomic Habits'",
        description: "Finish chapters 8–12 this week.",
        status: "in_progress",
        priority: "low",
        dueDate: addDays(7),
        userId: admin.id,
        categoryId: adminCats[3].id,
      },
      {
        title: "Morning workout routine",
        description: "30 min cardio + 20 min stretching every morning.",
        status: "in_progress",
        priority: "medium",
        dueDate: addDays(0),
        userId: admin.id,
        categoryId: adminCats[2].id,
      },
      {
        title: "Plan weekend trip",
        description: "Research hotels and book tickets for the long weekend.",
        status: "todo",
        priority: "low",
        dueDate: addDays(10),
        userId: admin.id,
        categoryId: adminCats[1].id,
      },
      {
        title: "Conduct user interviews",
        description: "Schedule and run 5 user interviews for the new feature.",
        status: "completed",
        priority: "high",
        dueDate: addDays(-3),
        userId: admin.id,
        categoryId: adminCats[0].id,
      },
    ]);

    // ── Todos for Demo User ──────────────────────────────────────
    await Todo.bulkCreate([
      {
        title: "Finish diploma project",
        description: "Complete the remaining features and prepare the presentation.",
        status: "in_progress",
        priority: "high",
        dueDate: addDays(14),
        userId: demoUser.id,
        categoryId: userCats[3].id,
      },
      {
        title: "Pay electricity bill",
        description: "Due before end of the month.",
        status: "todo",
        priority: "medium",
        dueDate: addDays(5),
        userId: demoUser.id,
        categoryId: userCats[2].id,
      },
      {
        title: "Buy groceries",
        description: "Milk, eggs, bread, fruits, vegetables.",
        status: "completed",
        priority: "low",
        dueDate: addDays(-1),
        userId: demoUser.id,
        categoryId: userCats[1].id,
      },
      {
        title: "Learn React Query",
        description: "Watch tutorials and build a small practice project.",
        status: "todo",
        priority: "medium",
        dueDate: addDays(8),
        userId: demoUser.id,
        categoryId: userCats[3].id,
      },
      {
        title: "Schedule dentist appointment",
        description: "Book appointment for the monthly check-up.",
        status: "todo",
        priority: "low",
        dueDate: addDays(12),
        userId: demoUser.id,
        categoryId: userCats[1].id,
      },
      {
        title: "Submit expense report",
        description: "Compile receipts and submit to the finance department.",
        status: "completed",
        priority: "high",
        dueDate: addDays(-2),
        userId: demoUser.id,
        categoryId: userCats[2].id,
      },
      {
        title: "Prepare project presentation",
        description: "Create slides summarizing the work done this semester.",
        status: "in_progress",
        priority: "high",
        dueDate: addDays(6),
        userId: demoUser.id,
        categoryId: userCats[0].id,
      },
      {
        title: "Update LinkedIn profile",
        description: "Add new skills, recent projects, and profile photo.",
        status: "todo",
        priority: "low",
        dueDate: addDays(20),
        userId: demoUser.id,
        categoryId: userCats[1].id,
      },
    ]);

    console.log("✅ Todos created");

    console.log(`
╔══════════════════════════════════════════════╗
║              SEED DATA SUMMARY               ║
╠══════════════════════════════════════════════╣
║  👤  Admin    → admin@demo.com / demo1234    ║
║  👤  User     → user@demo.com  / demo1234    ║
║  📂  Categories: 4 per user (8 total)        ║
║  ✅  Todos: 7 (admin) + 8 (user) = 15 total  ║
╚══════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
