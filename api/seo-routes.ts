import { Hono } from "hono";
import { getDb } from "./queries/connection";
import { blogPosts, guides, growDiaries } from "@db/schema";
import { desc } from "drizzle-orm";

const SITE_URL = "https://homyhomegrow.de";

export const seoApp = new Hono();

// ─── robots.txt ───────────────────────────────────────────
seoApp.get("/robots.txt", (c) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login/

Sitemap: ${SITE_URL}/api/sitemap.xml
`;
  return c.text(robots, 200, { "Content-Type": "text/plain" });
});

// ─── Sitemap XML ──────────────────────────────────────────
seoApp.get("/sitemap.xml", async (c) => {
  const db = getDb();

  const [posts, guideList, diaries] = await Promise.all([
    db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(desc(blogPosts.publishedAt)),
    db.select({ slug: guides.slug, updatedAt: guides.updatedAt })
      .from(guides)
      .where(desc(guides.publishedAt)),
    db.select({ slug: growDiaries.slug, updatedAt: growDiaries.updatedAt })
      .from(growDiaries)
      .where(desc(growDiaries.createdAt)),
  ]);

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/blog", priority: "0.8", changefreq: "daily" },
    { url: "/guides", priority: "0.8", changefreq: "weekly" },
    { url: "/diary", priority: "0.8", changefreq: "daily" },
    { url: "/gallery", priority: "0.6", changefreq: "weekly" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  for (const post of posts) {
    xml += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${formatDate(post.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  for (const guide of guideList) {
    xml += `  <url>
    <loc>${SITE_URL}/guides/${guide.slug}</loc>
    <lastmod>${formatDate(guide.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  for (const diary of diaries) {
    xml += `  <url>
    <loc>${SITE_URL}/diary/${diary.slug}</loc>
    <lastmod>${formatDate(diary.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  return c.text(xml, 200, {
    "Content-Type": "application/xml",
    "Cache-Control": "public, max-age=3600",
  });
});

// ─── RSS Feed XML ─────────────────────────────────────────
seoApp.get("/rss.xml", async (c) => {
  const db = getDb();

  const posts = await db
    .select({
      slug: blogPosts.slug,
      titleDe: blogPosts.titleDe,
      titleEn: blogPosts.titleEn,
      excerptDe: blogPosts.excerptDe,
      excerptEn: blogPosts.excerptEn,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(20);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>HomyHomegrow Blog</title>
  <link>${SITE_URL}</link>
  <description>Deine deutschsprachige Community für Cannabis Anbau. Guides, Grow Diaries &amp; mehr.</description>
  <language>de</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/api/rss.xml" rel="self" type="application/rss+xml" />
`;

  for (const post of posts) {
    const title = post.titleDe;
    const desc = post.excerptDe || "";
    const date = post.publishedAt ? new Date(post.publishedAt).toUTCString() : "";
    xml += `  <item>
    <title>${escapeXml(title)}</title>
    <link>${SITE_URL}/blog/${post.slug}</link>
    <guid>${SITE_URL}/blog/${post.slug}</guid>
    <pubDate>${date}</pubDate>
    <description>${escapeXml(desc)}</description>
  </item>
`;
  }

  xml += `</channel>
</rss>`;

  return c.text(xml, 200, {
    "Content-Type": "application/xml",
    "Cache-Control": "public, max-age=3600",
  });
});

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
