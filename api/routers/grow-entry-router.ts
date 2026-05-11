import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { growDiaryEntries } from "@db/schema";

export const growEntryRouter = createRouter({
  list: publicQuery
    .input(z.object({ diaryId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(growDiaryEntries)
        .where(eq(growDiaryEntries.diaryId, input.diaryId))
        .orderBy(asc(growDiaryEntries.phase), asc(growDiaryEntries.day));
    }),

  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [entry] = await db
        .select()
        .from(growDiaryEntries)
        .where(eq(growDiaryEntries.id, input.id));
      return entry;
    }),

  create: adminQuery
    .input(z.object({
      diaryId: z.number(),
      day: z.number().min(0),
      phase: z.enum(["vegetative", "flowering"]).optional(),
      titleDe: z.string().min(1),
      titleEn: z.string().optional(),
      contentDe: z.string().optional(),
      contentEn: z.string().optional(),
      images: z.array(z.string()).optional(),
      vpd: z.string().optional(),
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      fertilizer: z.string().optional(),
      additives: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(growDiaryEntries).values({
        diaryId: input.diaryId,
        day: input.day,
        phase: input.phase || "vegetative",
        titleDe: input.titleDe,
        titleEn: input.titleEn || input.titleDe,
        contentDe: input.contentDe || null,
        contentEn: input.contentEn || null,
        images: input.images || null,
        vpd: input.vpd || null,
        temperature: input.temperature || null,
        humidity: input.humidity || null,
        fertilizer: input.fertilizer || null,
        additives: input.additives || null,
        notes: input.notes || null,
      });
      return { success: true };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      day: z.number().min(0).optional(),
      phase: z.enum(["vegetative", "flowering"]).optional(),
      titleDe: z.string().min(1).optional(),
      titleEn: z.string().optional(),
      contentDe: z.string().optional(),
      contentEn: z.string().optional(),
      images: z.array(z.string()).optional(),
      vpd: z.string().optional(),
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      fertilizer: z.string().optional(),
      additives: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.day !== undefined) updateData.day = data.day;
      if (data.phase !== undefined) updateData.phase = data.phase;
      if (data.titleDe !== undefined) updateData.titleDe = data.titleDe;
      if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
      if (data.contentDe !== undefined) updateData.contentDe = data.contentDe;
      if (data.contentEn !== undefined) updateData.contentEn = data.contentEn;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.vpd !== undefined) updateData.vpd = data.vpd;
      if (data.temperature !== undefined) updateData.temperature = data.temperature;
      if (data.humidity !== undefined) updateData.humidity = data.humidity;
      if (data.fertilizer !== undefined) updateData.fertilizer = data.fertilizer;
      if (data.additives !== undefined) updateData.additives = data.additives;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await db.update(growDiaryEntries).set(updateData).where(eq(growDiaryEntries.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(growDiaryEntries).where(eq(growDiaryEntries.id, input.id));
      return { success: true };
    }),
});
