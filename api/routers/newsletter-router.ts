import { z } from "zod";
import { eq, desc, sql, like, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { newsletterSubscribers } from "@db/schema";
import { nanoid } from "nanoid";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";
import { sendConfirmationEmail, sendWelcomeEmail } from "../lib/email";

export const newsletterRouter = createRouter({
  // Public: Subscribe
  subscribe: publicQuery
    .input(
      z.object({
        email: z.string().email().max(320),
        name: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      const limit = checkRateLimit(ip, "newsletter", 3, 3_600_000);
      if (!limit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many subscription attempts. Please try again later.",
        });
      }

      const db = getDb();

      // Check if already exists
      const [existing] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email));

      if (existing) {
        if (existing.status === "confirmed") {
          return { success: true, message: "Already subscribed" };
        }
        if (existing.status === "unsubscribed") {
          // Re-subscribe: reset to pending with new token
          const token = nanoid(32);
          await db
            .update(newsletterSubscribers)
            .set({
              status: "pending",
              confirmToken: token,
              subscribedAt: new Date(),
              unsubscribedAt: null,
              unsubscribedReason: null,
            })
            .where(eq(newsletterSubscribers.id, existing.id));
          const emailSent = await sendConfirmationEmail({ to: input.email, token });
          return { success: true, message: emailSent ? "Please check your email" : "Confirm link generated", token: emailSent ? undefined : token };
        }
        // pending - resend confirmation
        const emailSent = await sendConfirmationEmail({ to: input.email, token: existing.confirmToken! });
        return { success: true, message: emailSent ? "Please check your email" : "Confirm link generated", token: emailSent ? undefined : existing.confirmToken! };
      }

      // New subscriber
      const token = nanoid(32);
      const unsubToken = nanoid(32);
      await db.insert(newsletterSubscribers).values({
        email: input.email,
        name: input.name,
        status: "pending",
        confirmToken: token,
        unsubscribeToken: unsubToken,
      });

      const emailSent = await sendConfirmationEmail({ to: input.email, token });
      return { success: true, message: emailSent ? "Please check your email" : "Confirm link generated", token: emailSent ? undefined : token };
    }),

  // Public: Confirm
  confirm: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [sub] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.confirmToken, input.token));

      if (!sub) return { success: false, message: "Invalid token" };
      if (sub.status === "confirmed") return { success: true, message: "Already confirmed" };

      await db
        .update(newsletterSubscribers)
        .set({ status: "confirmed", confirmedAt: new Date() })
        .where(eq(newsletterSubscribers.id, sub.id));

      await sendWelcomeEmail({ to: sub.email });
      return { success: true, message: "Subscription confirmed" };
    }),

  // Public: Unsubscribe
  unsubscribe: publicQuery
    .input(
      z.object({
        token: z.string(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [sub] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.unsubscribeToken, input.token));

      if (!sub) return { success: false, message: "Invalid token" };
      if (sub.status === "unsubscribed") return { success: true, message: "Already unsubscribed" };

      await db
        .update(newsletterSubscribers)
        .set({
          status: "unsubscribed",
          unsubscribedAt: new Date(),
          unsubscribedReason: input.reason || null,
        })
        .where(eq(newsletterSubscribers.id, sub.id));

      return { success: true, message: "Unsubscribed successfully" };
    }),

  // Admin: List with search
  list: adminQuery
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "unsubscribed", "all"]).optional().default("all"),
        search: z.string().optional(),
        limit: z.number().min(1).max(5000).default(500),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { status: "all", limit: 500, offset: 0 };

      let conditions = [];
      
      if (params.status && params.status !== "all") {
        conditions.push(eq(newsletterSubscribers.status, params.status));
      }
      
      if (params.search) {
        conditions.push(like(newsletterSubscribers.email, `%${params.search}%`));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const subs = await db
        .select()
        .from(newsletterSubscribers)
        .where(where)
        .orderBy(desc(newsletterSubscribers.subscribedAt))
        .limit(params.limit)
        .offset(params.offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(newsletterSubscribers)
        .where(where);

      return { subscribers: subs, total: countResult[0].count };
    }),

  // Admin: Add subscriber manually
  addSubscriber: adminQuery
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        status: z.enum(["pending", "confirmed"]).default("confirmed"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if exists
      const [existing] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email));

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already exists" });
      }

      const unsubToken = nanoid(32);
      await db.insert(newsletterSubscribers).values({
        email: input.email,
        name: input.name,
        status: input.status,
        confirmedAt: input.status === "confirmed" ? new Date() : null,
        unsubscribeToken: unsubToken,
      });

      return { success: true };
    }),

  // Admin: Confirm subscriber manually
  confirmSubscriber: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [sub] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.id, input.id));

      if (!sub) throw new TRPCError({ code: "NOT_FOUND" });
      if (sub.status === "confirmed") return { success: true, message: "Already confirmed" };

      await db
        .update(newsletterSubscribers)
        .set({ status: "confirmed", confirmedAt: new Date() })
        .where(eq(newsletterSubscribers.id, input.id));

      return { success: true, message: "Confirmed" };
    }),

  // Admin: Delete subscriber
  deleteSubscriber: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, input.id));
      return { success: true };
    }),

  // Admin: Stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(newsletterSubscribers);
    const confirmed = all.filter((s) => s.status === "confirmed").length;
    const pending = all.filter((s) => s.status === "pending").length;
    const unsubscribed = all.filter((s) => s.status === "unsubscribed").length;
    return { confirmed, pending, unsubscribed, total: all.length };
  }),

  // Admin: Get unsubscribe reasons
  unsubscribeReasons: adminQuery.query(async () => {
    const db = getDb();
    const subs = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "unsubscribed"));

    const withReason = subs.filter((s) => s.unsubscribedReason);
    return {
      count: subs.length,
      reasons: withReason.map((s) => ({ email: s.email, reason: s.unsubscribedReason, date: s.unsubscribedAt })),
    };
  }),
});
