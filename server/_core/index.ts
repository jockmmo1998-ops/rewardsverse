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

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, "0.0.0.0", () => {
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

// Run Drizzle migrations against Supabase PostgreSQL before listening.
// Migration files are additive/idempotent; no reset, drop, truncate, or seed runs.
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required in production");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const postgres = (await import("postgres")).default;
  const sql = postgres(databaseUrl, { ssl: databaseUrl.includes("supabase.com") ? { rejectUnauthorized: false } : undefined, max: 1, connect_timeout: 20 });
  const migrationsFolder = path.resolve(process.env.NODE_ENV === "production" ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd(), "drizzle-pg");
  try {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log("[Migration] Supabase PostgreSQL migrations (attempt " + attempt + "/4)...");
        await migrate(drizzle(sql), { migrationsFolder });
        console.log("[Migration] PostgreSQL migrations completed successfully");
        return;
      } catch (error) {
        if (attempt === 4) throw error;
        console.warn("[Migration] Attempt " + attempt + " failed; retrying:", error);
        await new Promise(resolve => setTimeout(resolve, attempt * 3000));
      }
    }
  } finally {
    await sql.end({ timeout: 5 }).catch(closeError => console.warn("[Migration] PostgreSQL connection close warning:", closeError));
  }
}

async function startServer() {
  const app = express();
  // Render terminates TLS at the proxy. Trust the first proxy so Express
  // correctly reports HTTPS when issuing the Secure session cookie.
  app.set("trust proxy", 1);
  const server = createServer(app);
  const configuredFrontendOrigin = process.env.PUBLIC_APP_URL?.replace(/\/$/, "");
  const allowedOrigins = new Set(
    [configuredFrontendOrigin, "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]
      .filter((origin): origin is string => Boolean(origin))
  );
  const getCorsOrigin = (req: express.Request) => {
    const origin = req.get("origin");
    return origin && allowedOrigins.has(origin) ? origin : undefined;
  };
  app.use((req, res, next) => {
    const origin = getCorsOrigin(req);
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") return res.sendStatus(origin ? 204 : 403);
    next();
  });
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
    const origin = getCorsOrigin(req);
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Vary", "Origin");
    }

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

  // Render's health scanner connects through the container network interface;
  // bind explicitly to all interfaces instead of relying on Node's default.
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
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
