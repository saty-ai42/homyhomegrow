import { z } from "zod";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { eq, desc, and, inArray, like } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { media, mediaTags } from "@db/schema";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "media");
const THUMB_DIR = path.resolve(UPLOAD_DIR, "thumbnails");

interface UploadResult {
  url: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

async function processMediaImage(buffer: Buffer, originalName: string): Promise<UploadResult> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });

  const id = randomBytes(8).toString("hex");
  const name = originalName.replace(/[^a-zA-Z0-9.]/g, "-").replace(/\.[^.]+$/, "");
  const baseName = `${name}-${id}`;

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const fullBuffer = await image
    .clone()
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(path.join(UPLOAD_DIR, `${baseName}.webp`), fullBuffer);

  const thumbBuffer = await sharp(buffer)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  await fs.writeFile(path.join(THUMB_DIR, `${baseName}.webp`), thumbBuffer);

  return {
    url: `/uploads/media/${baseName}.webp`,
    thumbnailUrl: `/uploads/media/thumbnails/${baseName}.webp`,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    sizeBytes: fullBuffer.length,
    filename: `${baseName}.webp`,
  };
}

export const mediaRouter = createRouter({
  // Upload media with optional tags
  upload: adminQuery
    .input(
      z.object({
        base64: z.string().min(1, "Image data required"),
        filename: z.string().min(1),
        mimeType: z.string(),
        caption: z.string().optional(),
        tags: z.array(z.string().max(50)).optional(), // e.g. ["blog", "guides", "newsletter"]
      })
    )
    .mutation(async ({ input }) => {
      const base64Data = input.base64.includes(",") ? input.base64.split(",")[1] : input.base64;
      const buffer = Buffer.from(base64Data, "base64");

      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error("File too large (max 10MB)");
      }
      if (!input.mimeType.startsWith("image/")) {
        throw new Error("Only images allowed");
      }

      const result = await processMediaImage(buffer, input.filename);

      const db = getDb();
      const [insertResult] = await db
        .insert(media)
        .values({
          filename: result.filename,
          originalName: input.filename,
          url: result.url,
          type: "image",
          sizeBytes: result.sizeBytes,
          captionDe: input.caption || null,
          captionEn: input.caption || null,
        })
        .$returningId();

      // Insert tags if provided
      if (input.tags && input.tags.length > 0) {
        await db.insert(mediaTags).values(
          input.tags.map((tag) => ({ mediaId: insertResult.id, tag: tag.toLowerCase() }))
        );
      }

      return {
        id: insertResult.id,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        filename: result.filename,
        sizeBytes: result.sizeBytes,
        width: result.width,
        height: result.height,
      };
    }),

  // List media with optional tag filter
  list: publicQuery
    .input(
      z.object({
        tag: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { tag: undefined, search: undefined, limit: 100, offset: 0 };

      let mediaItems: any[];

      if (params.tag) {
        // Filter by tag: join media with mediaTags
        const taggedMediaIds = await db
          .select({ mediaId: mediaTags.mediaId })
          .from(mediaTags)
          .where(eq(mediaTags.tag, params.tag.toLowerCase()));

        const ids = taggedMediaIds.map((t) => t.mediaId);
        if (ids.length === 0) {
          mediaItems = [];
        } else {
          mediaItems = await db
            .select()
            .from(media)
            .where(inArray(media.id, ids))
            .orderBy(desc(media.createdAt))
            .limit(params.limit ?? 100)
            .offset(params.offset ?? 0);
        }
      } else if (params.search) {
        mediaItems = await db
          .select()
          .from(media)
          .where(like(media.originalName, `%${params.search}%`))
          .orderBy(desc(media.createdAt))
          .limit(params.limit ?? 100)
          .offset(params.offset ?? 0);
      } else {
        mediaItems = await db
          .select()
          .from(media)
          .orderBy(desc(media.createdAt))
          .limit(params.limit ?? 100)
          .offset(params.offset ?? 0);
      }

      // Get tags for each media item
      const allTags = await db.select().from(mediaTags);
      const tagsByMedia = new Map<number, string[]>();
      for (const tag of allTags) {
        const existing = tagsByMedia.get(tag.mediaId) || [];
        existing.push(tag.tag);
        tagsByMedia.set(tag.mediaId, existing);
      }

      const items = mediaItems.map((m) => ({
        ...m,
        tags: tagsByMedia.get(m.id) || [],
      }));

      return { items, total: items.length };
    }),

  // Add tag to media
  addTag: adminQuery
    .input(z.object({ mediaId: z.number(), tag: z.string().min(1).max(50) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const normalizedTag = input.tag.toLowerCase().trim();

      // Check if tag already exists for this media
      const [existing] = await db
        .select()
        .from(mediaTags)
        .where(and(eq(mediaTags.mediaId, input.mediaId), eq(mediaTags.tag, normalizedTag)));

      if (existing) return { success: true, tag: normalizedTag };

      await db.insert(mediaTags).values({
        mediaId: input.mediaId,
        tag: normalizedTag,
      });

      return { success: true, tag: normalizedTag };
    }),

  // Remove tag from media
  removeTag: adminQuery
    .input(z.object({ mediaId: z.number(), tag: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(mediaTags)
        .where(and(eq(mediaTags.mediaId, input.mediaId), eq(mediaTags.tag, input.tag.toLowerCase())));
      return { success: true };
    }),

  // Get all available tags
  getTags: adminQuery.query(async () => {
    const db = getDb();
    const tags = await db
      .selectDistinct({ tag: mediaTags.tag })
      .from(mediaTags)
      .orderBy(mediaTags.tag);
    return tags.map((t) => t.tag);
  }),

  // Delete media (and its tags)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Delete tags first (foreign key constraint safety)
      await db.delete(mediaTags).where(eq(mediaTags.mediaId, input.id));
      // Delete media
      await db.delete(media).where(eq(media.id, input.id));
      return { success: true };
    }),
});
