import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads");
const THUMB_DIR = path.resolve(UPLOAD_DIR, "thumbnails");

interface UploadResult {
  url: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

export async function processImage(buffer: Buffer, originalName: string): Promise<UploadResult> {
  // Ensure directories exist
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });

  // Generate unique filename
  const id = randomBytes(8).toString("hex");
  const name = originalName.replace(/[^a-zA-Z0-9.]/g, "-").replace(/\.[^.]+$/, "");
  const baseName = `${name}-${id}`;

  // Process with Sharp
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Full-size: resize to max 1920px width, convert to WebP (quality 85)
  const fullBuffer = await image
    .clone()
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const fullPath = path.join(UPLOAD_DIR, `${baseName}.webp`);
  await fs.writeFile(fullPath, fullBuffer);

  // Thumbnail: 400px width, WebP (quality 75)
  const thumbBuffer = await sharp(buffer)
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  const thumbPath = path.join(THUMB_DIR, `${baseName}.webp`);
  await fs.writeFile(thumbPath, thumbBuffer);

  return {
    url: `/uploads/${baseName}.webp`,
    thumbnailUrl: `/uploads/thumbnails/${baseName}.webp`,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    sizeBytes: fullBuffer.length,
    filename: `${baseName}.webp`,
  };
}
