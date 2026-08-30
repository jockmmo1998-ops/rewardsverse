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
import path from "path";
import { fileURLToPath } from "url";
import { getDatabaseConnectionOptions } from "../db";

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

// Run database migrations at startup (only when DATABASE_URL is set).
// Render/TiDB connections can briefly drop while the database wakes up, so
// retry a few times before failing the production deployment.
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Migration] DATABASE_URL not set, skipping migration");
    return;
  }

  const mysql = await import("mysql2/promise");
  const { drizzle } = await import("drizzle-orm/mysql2");
  const { migrate } = await import("drizzle-orm/mysql2/migrator");
  const isProd = process.env.NODE_ENV === "production";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const migrationsFolder = isProd
    ? path.resolve(__dirname, "drizzle")
    : path.resolve(process.cwd(), "drizzle");
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let connection: Awaited<ReturnType<typeof mysql.default.createConnection>> | undefined;
    try {
      console.log(`[Migration] Running database migrations (attempt ${attempt}/${maxAttempts})...`);
      connection = await mysql.default.createConnection(getDatabaseConnectionOptions(databaseUrl));
      const drizzleDb = drizzle(connection);
      console.log("[Migration] Migrations folder:", migrationsFolder);
      await migrate(drizzleDb, { migrationsFolder });
      console.log("[Migration] ✅ Migrations completed successfully");
      return;
    } catch (error) {
      lastError = error;
      const errorMessage = [
        error instanceof Error ? error.message : String(error),
        error && typeof error === "object" && "cause" in error ? String((error as { cause?: unknown }).cause) : "",
      ].join(" ");
      if (/Table [^\n]*users[^\n]*already exists/i.test(errorMessage) && connection) {
        // Older deployments predate the migration journal. The generic
        // migrator stops at the first baseline table, so apply only the
        // additive admin schema idempotently instead of skipping it.
        console.warn("[Migration] Existing users table detected; applying additive admin schema.");
        const [columns] = await connection.query<any[]>(
          "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('accountStatus','suspensionReason')"
        );
        const names = new Set((columns as any[]).map(column => column.COLUMN_NAME));
        if (!names.has("accountStatus")) {
          await connection.query("ALTER TABLE `users` ADD COLUMN `accountStatus` enum('active','suspended') NOT NULL DEFAULT 'active'");
        }
        if (!names.has("suspensionReason")) {
          await connection.query("ALTER TABLE `users` ADD COLUMN `suspensionReason` text");
        }
        // Older production databases may have a partial withdrawals table.
        // Repair every column required by the current withdrawal flow before
        // the app accepts requests, rather than only repairing timestamps.
        await connection.query(`CREATE TABLE IF NOT EXISTS \`withdrawals\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`userId\` int NOT NULL,
          \`amount\` decimal(10,2) NOT NULL,
          \`cryptoType\` enum('bitcoin','ethereum','usdt_trc20','usdt_erc20','solana','litecoin','dogecoin','binance') NOT NULL,
          \`walletAddress\` text NOT NULL,
          \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
          \`adminNote\` text,
          \`approvedAt\` timestamp NULL,
          \`rejectedAt\` timestamp NULL,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        )`);
        const [withdrawalColumns] = await connection.query<any[]>(
          "SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'withdrawals'"
        );
        const withdrawalNames = new Set((withdrawalColumns as any[]).map(column => column.COLUMN_NAME));
        if (!withdrawalNames.has("userId")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `userId` int NOT NULL DEFAULT 0");
        }
        if (!withdrawalNames.has("amount")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `amount` decimal(10,2) NOT NULL DEFAULT '0.00'");
        }
        if (!withdrawalNames.has("cryptoType")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `cryptoType` enum('bitcoin','ethereum','usdt_trc20','usdt_erc20','solana','litecoin','dogecoin','binance') NOT NULL DEFAULT 'bitcoin'");
        }
        if (!withdrawalNames.has("walletAddress")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `walletAddress` text NOT NULL");
        }
        if (!withdrawalNames.has("status")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
        }
        if (!withdrawalNames.has("id")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `id` int AUTO_INCREMENT PRIMARY KEY FIRST");
        }
        if (!withdrawalNames.has("approvedAt")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `approvedAt` timestamp NULL");
        }
        if (!withdrawalNames.has("rejectedAt")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `rejectedAt` timestamp NULL");
        }
        if (!withdrawalNames.has("updatedAt")) {
          await connection.query("ALTER TABLE `withdrawals` ADD COLUMN `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }
        const cryptoColumn = (withdrawalColumns as any[]).find(column => column.COLUMN_NAME === "cryptoType");
        if (cryptoColumn && !String(cryptoColumn.COLUMN_TYPE).includes("binance")) {
          await connection.query("ALTER TABLE `withdrawals` MODIFY COLUMN `cryptoType` enum('bitcoin','ethereum','usdt_trc20','usdt_erc20','solana','litecoin','dogecoin','binance') NOT NULL");
        }
        await connection.query(`CREATE TABLE IF NOT EXISTS \`audit_logs\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`adminUserId\` int NOT NULL,
          \`action\` varchar(64) NOT NULL,
          \`targetType\` varchar(32),
          \`targetId\` varchar(128),
          \`details\` text,
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          CONSTRAINT \`audit_logs_id\` PRIMARY KEY(\`id\`)
        )`);
        await connection.query("CREATE INDEX IF NOT EXISTS `audit_logs_admin_idx` ON `audit_logs` (`adminUserId`)").catch(() => undefined);
        await connection.query("CREATE INDEX IF NOT EXISTS `audit_logs_action_idx` ON `audit_logs` (`action`)").catch(() => undefined);
        await connection.query("CREATE INDEX IF NOT EXISTS `audit_logs_created_idx` ON `audit_logs` (`createdAt`)").catch(() => undefined);
        console.warn("[Migration] Additive admin schema is ready.");
        return;
      }
      console.error(`[Migration] Attempt ${attempt} failed:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, attempt * 3_000));
      }
    } finally {
      if (connection) {
        await connection.end().catch(closeError =>
          console.warn("[Migration] Connection close warning:", closeError)
        );
      }
    }
  }

  // Never serve a production app against a partially migrated schema.
  if (isProd) {
    throw new Error("Database migration failed after retries; server startup aborted.", { cause: lastError });
  }
}

async function startServer() {
  const app = express();
  // Render terminates TLS at the proxy. Trust the first proxy so Express
  // correctly reports HTTPS when issuing the Secure session cookie.
  app.set("trust proxy", 1);
  const server = createServer(app);
  // Cấu hình body parser với giới hạn lớn hơn cho file upload
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerPostbackRoutes(app);

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

// Migrations run before the server starts. Admin access is promoted through the
// authenticated ADMIN_SECRET flow; no password or default account is seeded here.
runMigrations().then(() => startServer()).catch(console.error);

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
