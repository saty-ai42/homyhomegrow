import { z } from "zod";
import { eq, desc, and, like } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { blogPosts, categories } from "@db/schema";

export const blogRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];

      if (input?.status) {
        filters.push(eq(blogPosts.status, input.status));
      } else {
        filters.push(eq(blogPosts.status, "published"));
      }

      if (input?.categoryId) {
        filters.push(eq(blogPosts.categoryId, input.categoryId));
      }

      if (input?.search) {
        filters.push(like(blogPosts.titleDe, `%${input.search}%`));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;

      const posts = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          titleDe: blogPosts.titleDe,
          titleEn: blogPosts.titleEn,
          excerptDe: blogPosts.excerptDe,
          excerptEn: blogPosts.excerptEn,
          featuredImage: blogPosts.featuredImage,
          categoryId: blogPosts.categoryId,
          status: blogPosts.status,
          readTimeMinutes: blogPosts.readTimeMinutes,
          publishedAt: blogPosts.publishedAt,
          createdAt: blogPosts.createdAt,
        })
        .from(blogPosts)
        .where(where)
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      const countResult = await db
        .select({ count: db.$count(blogPosts) })
        .from(blogPosts)
        .where(where);

      return {
        posts,
        total: countResult[0]?.count ?? 0,
      };
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);

      const post = posts[0];
      if (!post) return null;

      let category = null;
      if (post.categoryId) {
        const cats = await db
          .select()
          .from(categories)
          .where(eq(categories.id, post.categoryId))
          .limit(1);
        category = cats[0] ?? null;
      }

      return { ...post, category };
    }),

  create: adminQuery
    .input(
      z.object({
        slug: z.string().min(1),
        titleDe: z.string().min(1),
        titleEn: z.string().min(1),
        excerptDe: z.string().optional(),
        excerptEn: z.string().optional(),
        contentDe: z.string().optional(),
        contentEn: z.string().optional(),
        featuredImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
        readTimeMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(blogPosts).values({
        ...input,
        publishedAt: input.status === "published" ? new Date() : undefined,
      });
      return result;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        titleDe: z.string().min(1).optional(),
        titleEn: z.string().min(1).optional(),
        excerptDe: z.string().optional(),
        excerptEn: z.string().optional(),
        contentDe: z.string().optional(),
        contentEn: z.string().optional(),
        featuredImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        readTimeMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();

      if (data.status === "published") {
        const existing = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.id, id))
          .limit(1);
        if (existing[0] && !existing[0].publishedAt) {
          (data as Record<string, unknown>).publishedAt = new Date();
        }
      }

      await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),
});
