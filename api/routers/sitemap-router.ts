import { desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { blogPosts, guides, growDiaries } from "@db/schema";

export const sitemapRouter = createRouter({
  sitemap: publicQuery.query(async () => {
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

    return {
      pages: [
        { url: "/", priority: 1.0 },
        { url: "/blog", priority: 0.8 },
        { url: "/guides", priority: 0.8 },
        { url: "/diary", priority: 0.8 },
        { url: "/gallery", priority: 0.7 },
        { url: "/about", priority: 0.6 },
        ...posts.map((p) => ({ url: `/blog/${p.slug}`, priority: 0.7, lastmod: p.updatedAt })),
        ...guideList.map((g) => ({ url: `/guides/${g.slug}`, priority: 0.7, lastmod: g.updatedAt })),
        ...diaries.map((d) => ({ url: `/diary/${d.slug}`, priority: 0.7, lastmod: d.updatedAt })),
      ],
    };
  }),

  rss: publicQuery.query(async () => {
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

    return {
      title: "HomyHomegrow Blog",
      description: "Cannabis Anbau Guides, Tips & Community",
      link: "https://homyhomegrow.de",
      items: posts.map((p) => ({
        title: p.titleDe,
        description: p.excerptDe,
        link: `/blog/${p.slug}`,
        pubDate: p.publishedAt,
      })),
    };
  }),
});
