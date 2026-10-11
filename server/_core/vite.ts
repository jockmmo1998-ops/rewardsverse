import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getSeoPage, normalizeSeoPath, SEO_SITE_ORIGIN, SEO_SOCIAL_IMAGE } from "../../shared/seo";

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

  // The application home route is /home; make the short domain URL a real
  // redirect so crawlers and browsers share one canonical entry point.
  app.get("/", (req, res) => {
    const query = req.originalUrl.startsWith("/?") ? req.originalUrl.slice(2) : "";
    res.redirect(301, `/home${query ? `?${query}` : ""}`);
  });

  app.use(express.static(distPath, {
    // Vite fingerprints JS/CSS/assets, so immutable caching is safe. HTML stays
    // revalidated so a deploy cannot leave users on an old asset manifest.
    setHeaders(res, filePath) {
      if (/\.(?:js|css|png|jpe?g|webp|svg|gif|ico|woff2?|ttf)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (/\.html$/i.test(filePath)) {
        res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
      }
    },
  }));

  const homeHeroPreload = '<link rel="preload" as="image" href="/rewardsverse-community-cutout-1280.webp" imagesrcset="/rewardsverse-community-cutout-640.webp 640w, /rewardsverse-community-cutout-1280.webp 1280w" imagesizes="(max-width: 700px) calc(100vw - 48px), 44vw" type="image/webp" fetchpriority="high" />';
  const homeNoscriptFallback = `<noscript><main style="max-width:760px;margin:3rem auto;padding:1.5rem;font:16px/1.6 system-ui,sans-serif;color:#f4f4f5"><h1>Your rewards space. Built for clarity.</h1><p>Explore live surveys, apps, games and partner offers through RewardsVerse. Track offer progress, earnings and payout details in one clear place. Offer availability and reward terms are provided by each partner.</p><p><a href="/register">Create an account</a> · <a href="/login">Sign in</a> · <a href="/support">Support</a></p></main></noscript>`;
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character));
  const routeSeoHead = (pathname: string) => {
    const routePath = normalizeSeoPath(pathname);
    const page = getSeoPage(routePath);
    const robots = page.indexable ? "index,follow" : "noindex,nofollow";
    const tags = [
      `<title data-rh="true">${escapeHtml(page.title)}</title>`,
      `<meta name="description" content="${escapeHtml(page.description)}" data-rh="true" />`,
      `<meta name="robots" content="${robots}" data-rh="true" />`,
    ];
    if (page.indexable) {
      const canonical = `${SEO_SITE_ORIGIN}${routePath}`;
      const image = `${SEO_SITE_ORIGIN}${SEO_SOCIAL_IMAGE}`;
      tags.push(
        `<link rel="canonical" href="${canonical}" data-rh="true" />`,
        '<meta property="og:type" content="website" data-rh="true" />',
        `<meta property="og:title" content="${escapeHtml(page.title)}" data-rh="true" />`,
        `<meta property="og:description" content="${escapeHtml(page.description)}" data-rh="true" />`,
        `<meta property="og:url" content="${canonical}" data-rh="true" />`,
        `<meta property="og:image" content="${image}" data-rh="true" />`,
        '<meta name="twitter:card" content="summary_large_image" data-rh="true" />',
        `<meta name="twitter:title" content="${escapeHtml(page.title)}" data-rh="true" />`,
        `<meta name="twitter:description" content="${escapeHtml(page.description)}" data-rh="true" />`,
        `<meta name="twitter:image" content="${image}" data-rh="true" />`,
      );
    }
    return tags.join("\n    ");
  };

  // Keep the SPA fallback for declared React routes only. Unknown paths must
  // return a real 404 instead of the index shell (soft-404).
  app.use("*", async (req, res, next) => {
    const routePath = normalizeRoutePath(req.originalUrl);
    if (VALID_SPA_ROUTES.has(routePath) || isOfferwallRoute(routePath)) {
      try {
        const indexPath = path.resolve(distPath, "index.html");
        const template = await fs.promises.readFile(indexPath, "utf-8");
        const isHome = routePath === "/home";
        const html = template
          .replace("<!-- ROUTE_SEO_HEAD -->", routeSeoHead(routePath))
          .replace("<!-- HOME_HERO_PRELOAD -->", isHome ? homeHeroPreload : "")
          .replace("<!-- HOME_NOSCRIPT_FALLBACK -->", isHome ? homeNoscriptFallback : "");
        res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
        res.status(200).type("html").send(html);
        return;
      } catch (error) {
        next(error);
        return;
      }
    }

    res.status(404).type("html").send(`<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>404 — Page not found</title></head>
  <body><main><h1>Page not found</h1><p>The requested page does not exist.</p><a href="/">Return to RewardsVerse</a></main></body>
</html>`);
  });
}
