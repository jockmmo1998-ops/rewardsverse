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
      if (/Table [^\n]*users[^\n]*already exists/i.test(errorMessage)) {
        console.warn("[Migration] Existing users table detected; continuing startup.");
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
