import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { newsletterImages } from "@db/schema";

const NL_UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "newsletter");
const NL_THUMB_DIR = path.resolve(NL_UPLOAD_DIR, "thumbnails");

interface NLUploadResult {
  url: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

async function processNewsletterImage(buffer: Buffer, originalName: string): Promise<NLUploadResult> {
  await fs.mkdir(NL_UPLOAD_DIR, { recursive: true });
  await fs.mkdir(NL_THUMB_DIR, { recursive: true });

  const id = randomBytes(8).toString("hex");
  const name = originalName.replace(/[^a-zA-Z0-9.]/g, "-").replace(/\.[^.]+$/, "");
  const baseName = `${name}-${id}`;

  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Full-size: max 1920px, WebP quality 85
  const fullBuffer = await image
    .clone()
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(path.join(NL_UPLOAD_DIR, `${baseName}.webp`), fullBuffer);

  // Thumbnail: 400px, WebP quality 75
  const thumbBuffer = await sharp(buffer)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  await fs.writeFile(path.join(NL_THUMB_DIR, `${baseName}.webp`), thumbBuffer);

  return {
    url: `/uploads/newsletter/${baseName}.webp`,
    thumbnailUrl: `/uploads/newsletter/thumbnails/${baseName}.webp`,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    sizeBytes: fullBuffer.length,
    filename: `${baseName}.webp`,
  };
}

export const newsletterImageRouter = createRouter({
  upload: adminQuery
    .input(
      z.object({
        base64: z.string().min(1, "Image data required"),
        filename: z.string().min(1),
        mimeType: z.string(),
        caption: z.string().optional(),
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

      const result = await processNewsletterImage(buffer, input.filename);

      const db = getDb();
      const [insertResult] = await db
        .insert(newsletterImages)
        .values({
          filename: result.filename,
          originalName: input.filename,
          url: result.url,
          type: "image",
          sizeBytes: result.sizeBytes,
          caption: input.caption || null,
        })
        .$returningId();

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

  list: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(newsletterImages)
      .orderBy(desc(newsletterImages.createdAt));
  }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(newsletterImages).where(eq(newsletterImages.id, input.id));
      return { success: true };
    }),
});
