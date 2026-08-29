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


// Run database migrations at startup (only when DATABASE_URL is set)
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[Migration] DATABASE_URL not set, skipping migration");
    return;
  }
  try {
    console.log("[Migration] Running database migrations...");
    // Lazy-import mysql2 and drizzle so the server starts without a DB
    const mysql = await import("mysql2/promise");
    const { drizzle } = await import("drizzle-orm/mysql2");
    const { migrate } = await import("drizzle-orm/mysql2/migrator");
    const connection = await mysql.default.createConnection(databaseUrl);
    const drizzleDb = drizzle(connection);
    const isProd = process.env.NODE_ENV === "production";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsFolder = isProd
      ? path.resolve(__dirname, "drizzle")
      : path.resolve(process.cwd(), "drizzle");
    console.log("[Migration] Migrations folder:", migrationsFolder);
    await migrate(drizzleDb, { migrationsFolder });
    await connection.end();
    console.log("[Migration] ✅ Migrations completed successfully");
  } catch (error) {
    console.error("[Migration] ❌ Migration failed:", error);
    // Never serve a production app against a partially migrated schema.
    // This makes deployment fail visibly instead of leaving auth broken.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database migration failed; server startup aborted.");
    }
  }
}


async function startServer() {
  const app = express();
  const server = createServer(app);
