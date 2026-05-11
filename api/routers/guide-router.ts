import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { guides, guideSteps } from "@db/schema";

export const guideRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];

      if (input?.difficulty) {
        filters.push(eq(guides.difficulty, input.difficulty));
      }
      if (input?.status) {
        filters.push(eq(guides.status, input.status));
      } else {
        filters.push(eq(guides.status, "published"));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;

      const items = await db
        .select()
        .from(guides)
        .where(where)
        .orderBy(desc(guides.publishedAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      return { guides: items, total: items.length };
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const guideList = await db
        .select()
        .from(guides)
        .where(eq(guides.slug, input.slug))
        .limit(1);

      const guide = guideList[0];
      if (!guide) return null;

      const steps = await db
        .select()
        .from(guideSteps)
        .where(eq(guideSteps.guideId, guide.id))
        .orderBy(guideSteps.stepNumber);

      return { ...guide, steps };
    }),

  create: adminQuery
    .input(
      z.object({
        slug: z.string().min(1),
        titleDe: z.string().min(1),
        titleEn: z.string().min(1),
        descriptionDe: z.string().optional(),
        descriptionEn: z.string().optional(),
        contentDe: z.string().optional(),
        contentEn: z.string().optional(),
        images: z.array(z.string()).optional(),
        featuredImage: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        estimatedTimeMinutes: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(guides).values({
        ...input,
        publishedAt: input.status === "published" ? new Date() : undefined,
      });
      return { success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        titleDe: z.string().min(1).optional(),
        titleEn: z.string().min(1).optional(),
        descriptionDe: z.string().optional(),
        descriptionEn: z.string().optional(),
        contentDe: z.string().optional(),
        contentEn: z.string().optional(),
        images: z.array(z.string()).optional(),
        featuredImage: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        estimatedTimeMinutes: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(guides).set(data).where(eq(guides.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(guideSteps).where(eq(guideSteps.guideId, input.id));
      await db.delete(guides).where(eq(guides.id, input.id));
      return { success: true };
    }),

  createStep: adminQuery
    .input(
      z.object({
        guideId: z.number(),
        stepNumber: z.number(),
        titleDe: z.string().min(1),
        titleEn: z.string().min(1),
        contentDe: z.string().optional(),
        contentEn: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(guideSteps).values(input);
      return { success: true };
    }),

  updateStep: adminQuery
    .input(
      z.object({
        id: z.number(),
        stepNumber: z.number().optional(),
        titleDe: z.string().min(1).optional(),
        titleEn: z.string().min(1).optional(),
        contentDe: z.string().optional(),
        contentEn: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(guideSteps).set(data).where(eq(guideSteps.id, id));
      return { success: true };
    }),

  deleteStep: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(guideSteps).where(eq(guideSteps.id, input.id));
      return { success: true };
    }),
});
