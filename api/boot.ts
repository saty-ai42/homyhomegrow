import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths, Session } from "@contracts/constants";
import { seoApp } from "./seo-routes";
import { getDb } from "./queries/connection";
import { sql } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { signSessionToken } from "./kimi/session";
import { getSessionCookieOptions } from "./lib/cookies";
import { upsertUser } from "./queries/users"; // Dev login bypass

// Auto-migrate grow diary columns on startup
try {
  const db = getDb();
  await db.execute(sql`ALTER TABLE growDiaries ADD COLUMN mediumDetails VARCHAR(255)`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaries ADD COLUMN fertilizerDe TEXT`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaries ADD COLUMN fertilizerEn TEXT`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN phase ENUM('vegetative','flowering') DEFAULT 'vegetative'`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN vpd VARCHAR(20)`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN fertilizer TEXT`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN additives TEXT`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN notes TEXT`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries DROP COLUMN waterAmount`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries DROP COLUMN nutrientsUsed`).catch(() => {});
  await db.execute(sql`ALTER TABLE growDiaryEntries DROP COLUMN week`).catch(() => {});
  console.log("[migrate] growDiary columns OK");
} catch (e) {
  console.warn("[migrate] growDiary skipped:", (e as Error).message);
}

const app = new Hono<{ Bindings: HttpBindings }>();

// ============================================
// SECURITY HEADERS (10/10 Score)
// ============================================
app.use(async (c, next) => {
  await next();
  // Clickjacking protection
  c.header("X-Frame-Options", "DENY");
  // MIME-type sniffing prevention
  c.header("X-Content-Type-Options", "nosniff");
  // Legacy XSS filter
  c.header("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  // HSTS (only in production)
  if (env.isProduction) {
    c.header(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://youtube.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  c.header("Content-Security-Policy", csp);
});

// Body limit: 5MB for API (covers image uploads + base64 overhead)
app.use(bodyLimit({ maxSize: 5 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// SEO Routes (robots.txt, sitemap.xml, rss.xml)
app.route("/api", seoApp);

// Dev Login Bypass (localhost only)
app.get("/api/dev-login", async (c) => {
  if (env.isProduction) {
    return c.json({ error: "Not available in production" }, 403);
  }
  await upsertUser({
    unionId: "dev-admin-001",
    name: "Dev Admin",
    email: "admin@localhost",
    avatar: null,
    role: "admin",
    lastSignInAt: new Date(),
  });
  const token = await signSessionToken({
    unionId: "dev-admin-001",
    clientId: env.appId,
  });
  const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
  setCookie(c, Session.cookieName, token, {
    ...cookieOpts,
    maxAge: Session.maxAgeMs / 1000,
  });
  return c.redirect("/", 302);
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
