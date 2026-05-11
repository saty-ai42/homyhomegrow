import { z } from "zod";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pageViews } from "@db/schema";
import { checkRateLimit, getClientIp } from "./lib/rate-limit";

export const analyticsRouter = createRouter({
  track: publicQuery
    .input(
      z.object({
        path: z.string().min(1).max(500),
        referrer: z.string().max(500).optional(),
        userAgent: z.string().max(255).optional(),
        country: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      const limit = checkRateLimit(ip, `analytics:${input.path}`, 1, 30_000);
      if (!limit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded",
        });
      }
      const db = getDb();
      await db.insert(pageViews).values({
        path: input.path,
        referrer: input.referrer || null,
        userAgent: input.userAgent || null,
        country: input.country || null,
      });
      return { success: true };
    }),

  stats: publicQuery
    .query(async () => {
      const db = getDb();

      const [totalViews] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews);

      const [todayViews] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews)
        .where(sql`DATE(createdAt) = CURDATE()`);

      const [yesterdayViews] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews)
        .where(sql`DATE(createdAt) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`);

      const topPages = await db
        .select({
          path: pageViews.path,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageViews)
        .groupBy(pageViews.path)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10);

      const last7Days = await db
        .select({
          date: sql<string>`DATE(createdAt)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageViews)
        .where(sql`createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`)
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return {
        totalViews: totalViews.count,
        todayViews: todayViews.count,
        yesterdayViews: yesterdayViews.count,
        topPages,
        last7Days,
      };
    }),
});
