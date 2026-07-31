import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerPostbackRoutes } from "./postback";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sseManager } from "./sse";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Tự động chạy migration khi server khởi động
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Migration] DATABASE_URL not set, skipping migration");
    return;
  }
  try {
    console.log("[Migration] Running database migrations...");
    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection);
    // Tính migration path dựa trên môi trường:
    // - Prod: node dist/index.js  → __dirname = dist/ → dist/drizzle (đã cp vào build)
    // - Dev:  tsx server/_core/index.ts → dùng process.cwd()/drizzle (source folder)
    const isProd = process.env.NODE_ENV === "production";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsFolder = isProd
      ? path.resolve(__dirname, "drizzle")
      : path.resolve(process.cwd(), "drizzle");
    console.log("[Migration] Migrations folder:", migrationsFolder);
    await migrate(db, { migrationsFolder });
    await connection.end();
    console.log("[Migration] ✅ Migrations completed successfully");
  } catch (error) {
    console.error("[Migration] ❌ Migration failed:", error);
    // Không crash server nếu migration lỗi (bảng đã tồn tại thì OK)
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Cấu hình body parser với giới hạn lớn hơn cho file upload
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerPostbackRoutes(app);

  // ── TEST ENDPOINT: Simulate a postback without a real offerwall ──────────
  // GET /api/postback/test?username=Admin&amount=0.01&provider=gemiwall
  app.get("/api/postback/test", async (req, res) => {
    const username = (req.query.username as string) || "Admin";
    const amount   = parseFloat((req.query.amount  as string) || "0.01");
    const provider = (req.query.provider as string) || "test";

    const dbConn = await (await import("../db")).getDb();
    const dbStatus = dbConn ? "connected" : "DISCONNECTED — DATABASE_URL missing or invalid";

    if (!dbConn) {
      return res.status(500).json({ success: false, step: "db_connect", dbStatus,
        hint: "Set DATABASE_URL in .env and restart the server." });
    }

    const user = await (await import("../db")).getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ success: false, step: "find_user", dbStatus,
        searched: username, hint: `User "${username}" not found. Must be an existing registered username.` });
    }

    const balanceBefore = parseFloat(user.balance || "0");

    try {
      await (await import("../db")).addBalance(user.id, amount);
    } catch (err: any) {
      return res.status(500).json({ success: false, step: "addBalance", dbStatus,
        error: err?.message, hint: "DB connected but addBalance failed — check schema / run migrations." });
    }

    const updated     = await (await import("../db")).getUserById(user.id);
    const balanceAfter = parseFloat(updated?.balance || "0");

    // Side effects
    await Promise.allSettled([
      (await import("../db")).addEarning({ userId: user.id, amount: amount.toFixed(2), type: "offer", source: `[${provider}] Test postback` }),
      (await import("../db")).addWalletTransaction({ userId: user.id, type: "credit", amount: amount.toFixed(2), description: `Test postback from ${provider}`, source: provider }),
      (await import("../db")).addOfferHistory({ userId: user.id, provider, offerName: "Test Offer", amount: amount.toFixed(2), externalId: `test:${Date.now()}`, status: "completed" }),
      (await import("../db")).addNotification({ userId: user.id, title: `Test Reward $${amount.toFixed(2)}`, message: `Test postback credited $${amount.toFixed(2)} from ${provider}.`, type: "reward", isRead: 0 }),
    ]);

    sseManager.sendPostbackEvent(user.id, { type: "postback", provider, amount, offerName: "Test Offer", timestamp: new Date().toISOString() });

    return res.json({
      success: true,
      message: `✅ Test postback OK — credited $${amount.toFixed(2)} to ${username}`,
      user: { id: user.id, username: user.username },
      balance: { before: balanceBefore.toFixed(2), after: balanceAfter.toFixed(2), credited: amount.toFixed(2) },
      dbStatus,
      sseSent: true,
      hint: "If balance increased → DB + full postback flow is working correctly.",
    });
  });

  // SSE endpoint cho real-time notifications
  app.get("/api/sse/subscribe", (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Gửi tin nhắn kết nối ban đầu
    res.write(`data: ${JSON.stringify({ type: "connected", message: "SSE connection established" })}\n\n`);

    // Đăng ký kết nối
    sseManager.registerConnection(userIdNum, res);

    console.log(`[SSE] User ${userIdNum} subscribed. Total connections: ${sseManager.getTotalConnections()}`);
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Development dùng Vite, production dùng static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Tự động tạo tài khoản admin mặc định nếu chưa tồn tại
async function seedAdminAccount() {
  try {
    const existing = await db.getUserByUsername("Admin");
    const hashedPassword = await bcrypt.hash("Nkok123123", 10);
    if (existing) {
      // Đảm bảo role=admin và password đúng
      await db.updateUserProfile(existing.id, { role: "admin", password: hashedPassword });
      console.log("[Seed] ✅ Tài khoản Admin đã tồn tại — đã cập nhật role=admin & password.");
    } else {
      await db.upsertUser({
        openId: "virtual_Admin_seeded",
        username: "Admin",
        password: hashedPassword,
        name: "Admin",
        role: "admin",
        refCode: "ADMI0001",
        balance: "0.00",
        xp: 0,
        streak: 0,
        offersCompleted: 0,
        totalEarned: "0.00",
        refEarnings: "0.00",
        loginMethod: "virtual",
        lastSignedIn: new Date(),
      });
      console.log("[Seed] ✅ Đã tạo tài khoản Admin mới (username=Admin, role=admin).");
    }
  } catch (err) {
    console.warn("[Seed] ⚠️ Không thể seed admin account:", err);
  }
}

// Chạy migration → seed admin → start server
runMigrations().then(() => seedAdminAccount()).then(() => startServer()).catch(console.error);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received, closing SSE connections...");
  sseManager.closeAll();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Server] SIGINT received, closing SSE connections...");
  sseManager.closeAll();
  process.exit(0);
});
