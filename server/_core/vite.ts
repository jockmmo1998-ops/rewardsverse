import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

const VALID_SPA_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/home",
  "/dashboard",
  "/offerwalls",
  "/leaderboard",
  "/achievements",
  "/history",
  "/referrals",
  "/withdraw",
  "/wallet",
  "/profile",
  "/settings",
  "/support",
  "/admin",
  "/admin/login",
  "/privacy",
  "/terms",
  "/cookies",
  "/reward-policy",
  "/withdrawal-policy",
  "/faq",
]);

function normalizeRoutePath(url: string): string {
  const pathname = new URL(url, "http://localhost").pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function isOfferwallRoute(routePath: string): boolean {
  // Offerwall pages are client-side routes. Keep the fallback scoped to one
  // path segment so unknown server/API paths still receive a real 404.
  return /^\/offerwalls\/[^/]+$/.test(routePath);
}

export function serveStatic(app: Express) {
  // Khi bundle bằng esbuild, __dirname trỏ vào dist/
  // Frontend build ra dist/public nên path luôn là dist/public
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, {
    // Only browser-cache immutable-ish static assets. HTML remains uncached so
    // deploys and auth/session entry points never get stuck behind stale markup.
    setHeaders(res, filePath) {
      if (/\.(?:js|css|png|jpe?g|webp|svg|gif|ico|woff2?|ttf)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
  }));

  // Keep the SPA fallback for declared React routes only. Unknown paths must
  // return a real 404 instead of the index shell (soft-404).
  app.use("*", (req, res) => {
    const routePath = normalizeRoutePath(req.originalUrl);
    if (VALID_SPA_ROUTES.has(routePath) || isOfferwallRoute(routePath)) {
      res.sendFile(path.resolve(distPath, "index.html"));
      return;
    }

    res.status(404).type("html").send(`<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 — Page not found</title></head>
  <body><main><h1>Page not found</h1><p>The requested page does not exist.</p><a href="/">Return to RewardsVerse</a></main></body>
</html>`);
  });
}
