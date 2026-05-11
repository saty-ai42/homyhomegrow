import { authRouter } from "./auth-router";
import { blogRouter } from "./routers/blog-router";
import { guideRouter } from "./routers/guide-router";
import { categoryRouter } from "./routers/category-router";
import { diaryRouter } from "./routers/diary-router";
import { mediaRouter } from "./routers/media-router";
import { newsletterRouter } from "./routers/newsletter-router";
import { sitemapRouter } from "./routers/sitemap-router";
import { analyticsRouter } from "./analytics-router";
import { newsletterCampaignRouter } from "./routers/newsletter-campaign-router";
import { newsletterImageRouter } from "./routers/newsletter-image-router";
import { growEntryRouter } from "./routers/grow-entry-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  blog: blogRouter,
  guide: guideRouter,
  category: categoryRouter,
  diary: diaryRouter,
  media: mediaRouter,
  newsletter: newsletterRouter,
  sitemap: sitemapRouter,
  analytics: analyticsRouter,
  newsletterCampaign: newsletterCampaignRouter,
  newsletterImage: newsletterImageRouter,
  growEntry: growEntryRouter,
});

export type AppRouter = typeof appRouter;
