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

async function startServer() {
  const app = express();
  // Render terminates TLS at the proxy. Trust the first proxy so Express
  // correctly reports HTTPS when issuing the Secure session cookie.
  app.set("trust proxy", 1);
  const server = createServer(app);
  // Cấu hình body parser với giới hạn lớn hơn cho file upload
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const allowedOrigins = new Set([
    "https://rewardsverse.online",
    "https://www.rewardsverse.online",
  ]);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") {
      return origin && allowedOrigins.has(origin) ? res.sendStatus(204) : res.sendStatus(403);
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

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

// The migration branch must never mutate the existing production database at startup.
// Schema migrations remain in the repository for explicit, separately controlled use.
startServer().catch(console.error);

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
