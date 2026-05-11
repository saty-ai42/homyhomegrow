import { z } from "zod";
import { eq, desc, asc, and } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { growDiaries, growDiaryEntries } from "@db/schema";
import { sql } from "drizzle-orm";

export const diaryRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [eq(growDiaries.isPublic, "public")];
      if (input?.status) {
        filters.push(eq(growDiaries.status, input.status as any));
      }
      const where = and(...filters);
      const diaries = await db
        .select()
        .from(growDiaries)
        .where(where)
        .orderBy(desc(growDiaries.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);
      return { diaries, total: diaries.length };
    }),

  listAll: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).default({})
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];
      if (input.status) {
        filters.push(eq(growDiaries.status, input.status as any));
      }
      const where = filters.length > 0 ? and(...filters) : undefined;
      const diaries = await db
        .select()
        .from(growDiaries)
        .where(where)
        .orderBy(desc(growDiaries.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return { diaries, total: diaries.length };
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [diary] = await db
        .select()
        .from(growDiaries)
        .where(eq(growDiaries.slug, input.slug))
        .limit(1);
      if (!diary || diary.isPublic === "private") return null;
      const entries = await db
        .select()
        .from(growDiaryEntries)
        .where(eq(growDiaryEntries.diaryId, diary.id))
        .orderBy(asc(growDiaryEntries.phase), asc(growDiaryEntries.day));
      return { ...diary, entries };
    }),

  create: adminQuery
    .input(z.object({
      slug: z.string().min(1),
      strainNameDe: z.string().min(1),
      strainNameEn: z.string().min(1),
      breeder: z.string().optional(),
      seedType: z.enum(["feminized", "regular", "autoflowering", "clone"]).optional(),
      growMethod: z.enum(["soil", "coco", "hydro", "aeroponic"]).optional(),
      mediumDetails: z.string().optional(),
      fertilizerDe: z.string().optional(),
      fertilizerEn: z.string().optional(),
      status: z.enum(["germination", "vegetative", "flowering", "harvesting", "curing", "completed"]).optional(),
      startDate: z.string().optional(),
      descriptionDe: z.string().optional(),
      descriptionEn: z.string().optional(),
      isPublic: z.enum(["public", "private"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { startDate, ...rest } = input;
      await db.insert(growDiaries).values({
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
      } as any);
      return { success: true };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      slug: z.string().min(1).optional(),
      strainNameDe: z.string().min(1).optional(),
      strainNameEn: z.string().min(1).optional(),
      breeder: z.string().optional(),
      seedType: z.enum(["feminized", "regular", "autoflowering", "clone"]).optional(),
      growMethod: z.enum(["soil", "coco", "hydro", "aeroponic"]).optional(),
      mediumDetails: z.string().optional(),
      fertilizerDe: z.string().optional(),
      fertilizerEn: z.string().optional(),
      status: z.enum(["germination", "vegetative", "flowering", "harvesting", "curing", "completed"]).optional(),
      startDate: z.string().optional(),
      descriptionDe: z.string().optional(),
      descriptionEn: z.string().optional(),
      isPublic: z.enum(["public", "private"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, startDate, ...data } = input;
      const db = getDb();
      const updateData: Record<string, unknown> = { ...data };
      if (startDate) updateData.startDate = new Date(startDate);
      await db.update(growDiaries).set(updateData).where(eq(growDiaries.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(growDiaryEntries).where(eq(growDiaryEntries.diaryId, input.id));
      await db.delete(growDiaries).where(eq(growDiaries.id, input.id));
      return { success: true };
    }),

  setup: adminQuery
    .mutation(async () => {
      const db = getDb();
      // Fehlende Spalten zu growDiaries hinzufugen
      try { await db.execute(sql`ALTER TABLE growDiaries ADD COLUMN mediumDetails VARCHAR(255)`); } catch { /* existiert bereits */ }
      try { await db.execute(sql`ALTER TABLE growDiaries ADD COLUMN fertilizerDe TEXT`); } catch { /* existiert bereits */ }
      try { await db.execute(sql`ALTER TABLE growDiaries ADD COLUMN fertilizerEn TEXT`); } catch { /* existiert bereits */ }

      // Fehlende Spalten zu growDiaryEntries hinzufugen
      try { await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN phase ENUM('vegetative','flowering') DEFAULT 'vegetative' NOT NULL`); } catch { /* existiert bereits */ }
      try { await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN vpd VARCHAR(20)`); } catch { /* existiert bereits */ }
      try { await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN fertilizer TEXT`); } catch { /* existiert bereits */ }
      try { await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN additives TEXT`); } catch { /* existiert bereits */ }
      try { await db.execute(sql`ALTER TABLE growDiaryEntries ADD COLUMN notes TEXT`); } catch { /* existiert bereits */ }

      // Alte/umbenannte Spalten entfernen
      try { await db.execute(sql`ALTER TABLE growDiaryEntries DROP COLUMN waterAmount`); } catch { /* existiert nicht */ }
      try { await db.execute(sql`ALTER TABLE growDiaryEntries DROP COLUMN nutrientsUsed`); } catch { /* existiert nicht */ }
      try { await db.execute(sql`ALTER TABLE growDiaryEntries DROP COLUMN week`); } catch { /* existiert nicht */ }

      return { success: true };
    }),

  seed: adminQuery
    .mutation(async () => {
      const db = getDb();
      // Alle alten Daten loschen
      await db.delete(growDiaryEntries);
      await db.delete(growDiaries);

      // Grow 1: Northern Lights
      const [grow1] = await db.insert(growDiaries).values({
        slug: "northern-lights",
        strainNameDe: "Northern Lights",
        strainNameEn: "Northern Lights",
        breeder: "Sensi Seeds",
        seedType: "feminized",
        growMethod: "soil",
        mediumDetails: "BioBizz Light Mix",
        fertilizerDe: "BioBizz Root Juice, Bio Grow, Bio Bloom, Top Max, Alg-A-Mic",
        fertilizerEn: "BioBizz Root Juice, Bio Grow, Bio Bloom, Top Max, Alg-A-Mic",
        status: "flowering",
        startDate: new Date("2026-01-15"),
        descriptionDe: "Mein erster Grow mit Northern Lights. Indoor in Bio-Erde unter 300W LED. 60x60x160cm Growbox.",
        isPublic: "public",
      }).$returningId();

      // Grow 2: White Widow
      const [grow2] = await db.insert(growDiaries).values({
        slug: "white-widow",
        strainNameDe: "White Widow",
        strainNameEn: "White Widow",
        breeder: "Dutch Passion",
        seedType: "feminized",
        growMethod: "coco",
        mediumDetails: "Canna Coco Professional Plus",
        fertilizerDe: "Canna A+B, Rhizotonic, Cannazym, PK 13/14, CalMag",
        fertilizerEn: "Canna A+B, Rhizotonic, Cannazym, PK 13/14, CalMag",
        status: "vegetative",
        startDate: new Date("2026-03-01"),
        descriptionDe: "White Widow in Coco/Perlite 70/30. 240W Quantum Board LED. LST geplant.",
        isPublic: "public",
      }).$returningId();

      // Eintrage Northern Lights
      await db.insert(growDiaryEntries).values([
        { diaryId: grow1.id, day: 1, phase: "vegetative", titleDe: "Samen keimen", titleEn: "Seeds germinating", vpd: "0.8", temperature: 24, humidity: 70, fertilizer: "Keiner", additives: "Keine", notes: "Samen in feuchtes Kuchenpapier. Nach 36h Riss sichtbar." },
        { diaryId: grow1.id, day: 5, phase: "vegetative", titleDe: "Im Medium", titleEn: "In medium", vpd: "0.9", temperature: 25, humidity: 65, fertilizer: "Keiner", additives: "Root Juice", notes: "Samen in 3L Topf gesetzt. Erste Rundblatter entfalten sich." },
        { diaryId: grow1.id, day: 14, phase: "vegetative", titleDe: "Wachstum", titleEn: "Growth", vpd: "1.0", temperature: 26, humidity: 60, fertilizer: "0.5ml/l Bio Grow", additives: "Root Juice", notes: "3 Knotenpaare. Blatter sehen dunkelgrun und gesund aus." },
        { diaryId: grow1.id, day: 28, phase: "vegetative", titleDe: "Topping", titleEn: "Topping", vpd: "1.1", temperature: 26, humidity: 55, fertilizer: "1ml/l Bio Grow", additives: "Alg-A-Mic", notes: "Topping beim 5. Knoten. Pflanze reagiert gut, Seitentriebe kommen." },
        { diaryId: grow1.id, day: 42, phase: "vegetative", titleDe: "Letzter Vegi-Tag", titleEn: "Last veg day", vpd: "1.0", temperature: 25, humidity: 50, fertilizer: "1ml/l Bio Grow", additives: "Cannazym, Alg-A-Mic", notes: "Pflanze ist 45cm hoch. 8 Haupttriebe. Morgen Umstellung auf 12/12." },
        { diaryId: grow1.id, day: 43, phase: "flowering", titleDe: "Blute Start", titleEn: "Flower start", vpd: "1.2", temperature: 24, humidity: 50, fertilizer: "0.5ml/l Bio Grow + 0.5ml/l Bio Bloom", additives: "Alg-A-Mic", notes: "Licht auf 12/12 umgestellt. Erste Blutenstempel sichtbar." },
        { diaryId: grow1.id, day: 55, phase: "flowering", titleDe: "Blute Woche 2", titleEn: "Flower week 2", vpd: "1.3", temperature: 24, humidity: 48, fertilizer: "1ml/l Bio Bloom", additives: "Top Max, Alg-A-Mic", notes: "Bluten bilden sich. Trichome noch klar. Geruch wird intensiver." },
        { diaryId: grow1.id, day: 70, phase: "flowering", titleDe: "Blute Woche 4", titleEn: "Flower week 4", vpd: "1.4", temperature: 23, humidity: 45, fertilizer: "1.5ml/l Bio Bloom", additives: "Top Max", notes: "Trichome werden milchig. Zuckerblatter fette. Starker Duft!" },
      ]);

      // Eintrage White Widow
      await db.insert(growDiaryEntries).values([
        { diaryId: grow2.id, day: 1, phase: "vegetative", titleDe: "Aussaat", titleEn: "Sowing", vpd: "0.8", temperature: 25, humidity: 75, fertilizer: "Keiner", additives: "Rhizotonic", notes: "Samen in 5L Airpot mit vorgewaschenem Coco gesetzt." },
        { diaryId: grow2.id, day: 7, phase: "vegetative", titleDe: "Keimling", titleEn: "Seedling", vpd: "0.9", temperature: 25, humidity: 65, fertilizer: "Keiner", additives: "Rhizotonic", notes: "Keimling ist 4cm hoch. Erste echte Blatter zeigen sich." },
        { diaryId: grow2.id, day: 18, phase: "vegetative", titleDe: "Starkes Wachstum", titleEn: "Strong growth", vpd: "1.0", temperature: 26, humidity: 60, fertilizer: "0.4ml/l A+B", additives: "Rhizotonic, CalMag", notes: "5 Knotenpaare. LST mit Soft-Ties gestartet. Trieb wird nach unten gebogen." },
        { diaryId: grow2.id, day: 30, phase: "vegetative", titleDe: "Buschig", titleEn: "Bushy", vpd: "1.1", temperature: 26, humidity: 55, fertilizer: "1ml/l A+B", additives: "CalMag", notes: "LST zahlt sich aus. 10+ gleichmaBige Triebe. Pflanze ist sehr buschig." },
      ]);

      return { success: true };
    }),
});
