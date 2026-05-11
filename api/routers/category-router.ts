import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { categories } from "@db/schema";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const cats = await db.select().from(categories).orderBy(categories.nameDe);
    return cats;
  }),

  create: adminQuery
    .input(
      z.object({
        slug: z.string().min(1),
        nameDe: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionDe: z.string().optional(),
        descriptionEn: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(categories).values(input);
      return { success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        nameDe: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        descriptionDe: z.string().optional(),
        descriptionEn: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(categories).set(data).where(eq(categories.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
