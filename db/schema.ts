import {
  mysqlTable,
  mysqlEnum,
  bigint,
  varchar,
  text,
  timestamp,
  json,
  bigint,
  int,
  date,
} from "drizzle-orm/mysql-core";

// ============================================
// Users (Auth System)
// ============================================
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// Categories
// ============================================
export const categories = mysqlTable("categories", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  nameDe: varchar("nameDe", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  descriptionDe: text("descriptionDe"),
  descriptionEn: text("descriptionEn"),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ============================================
// Blog Posts
// ============================================
export const blogPosts = mysqlTable("blogPosts", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleDe: varchar("titleDe", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  excerptDe: text("excerptDe"),
  excerptEn: text("excerptEn"),
  contentDe: text("contentDe"),
  contentEn: text("contentEn"),
  featuredImage: text("featuredImage"),
  images: json("images").$type<string[]>(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  readTimeMinutes: int("readTimeMinutes"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ============================================
// Guides
// ============================================
export const guides = mysqlTable("guides", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleDe: varchar("titleDe", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  descriptionDe: text("descriptionDe"),
  descriptionEn: text("descriptionEn"),
  contentDe: text("contentDe"),
  contentEn: text("contentEn"),
  images: json("images").$type<string[]>(),
  featuredImage: text("featuredImage"),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  estimatedTimeMinutes: int("estimatedTimeMinutes"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Guide = typeof guides.$inferSelect;
export type InsertGuide = typeof guides.$inferInsert;

// ============================================
// Guide Steps
// ============================================
export const guideSteps = mysqlTable("guideSteps", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  guideId: bigint("guideId", { mode: "number", unsigned: true }).notNull(),
  stepNumber: int("stepNumber").notNull(),
  titleDe: varchar("titleDe", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  contentDe: text("contentDe"),
  contentEn: text("contentEn"),
  images: json("images").$type<string[]>(),
});

export type GuideStep = typeof guideSteps.$inferSelect;
export type InsertGuideStep = typeof guideSteps.$inferInsert;

// ============================================
// Media Library
// ============================================
export const media = mysqlTable("media", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  type: mysqlEnum("type", ["image", "video"]).default("image").notNull(),
  sizeBytes: bigint("sizeBytes", { mode: "number", unsigned: true }),
  width: int("width"),
  height: int("height"),
  captionDe: text("captionDe"),
  captionEn: text("captionEn"),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

// ============================================
// Grow Diaries
// ============================================
export const growDiaries = mysqlTable("growDiaries", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  // Sorte
  strainNameDe: varchar("strainNameDe", { length: 255 }).notNull(),
  strainNameEn: varchar("strainNameEn", { length: 255 }).notNull(),
  breeder: varchar("breeder", { length: 255 }),
  seedType: mysqlEnum("seedType", ["feminized", "regular", "autoflowering", "clone"]).default("feminized").notNull(),
  // Medium
  growMethod: mysqlEnum("growMethod", ["soil", "coco", "hydro", "aeroponic"]).default("soil").notNull(),
  mediumDetails: varchar("mediumDetails", { length: 255 }),
  // Dunger
  fertilizerDe: text("fertilizerDe"),
  fertilizerEn: text("fertilizerEn"),
  status: mysqlEnum("status", ["germination", "vegetative", "flowering", "harvesting", "curing", "completed"]).default("germination").notNull(),
  startDate: date("startDate"),
  descriptionDe: text("descriptionDe"),
  descriptionEn: text("descriptionEn"),
  featuredImage: text("featuredImage"),
  images: json("images").$type<string[]>(),
  isPublic: mysqlEnum("isPublic", ["public", "private"]).default("public").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type GrowDiary = typeof growDiaries.$inferSelect;
export type InsertGrowDiary = typeof growDiaries.$inferInsert;

// ============================================
// Grow Diary Entries (Tageseintrage)
// ============================================
export const growDiaryEntries = mysqlTable("growDiaryEntries", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  diaryId: bigint("diaryId", { mode: "number", unsigned: true }).notNull(),
  day: int("day").notNull(),
  phase: mysqlEnum("phase", ["vegetative", "flowering"]).default("vegetative").notNull(),
  titleDe: varchar("titleDe", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  contentDe: text("contentDe"),
  contentEn: text("contentEn"),
  images: json("images").$type<string[]>(),
  // Umgebung
  vpd: varchar("vpd", { length: 20 }),
  temperature: int("temperature"),
  humidity: int("humidity"),
  // Dunger & Zusatze
  fertilizer: text("fertilizer"),
  additives: text("additives"),
  // Sonstiges
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrowDiaryEntry = typeof growDiaryEntries.$inferSelect;
export type InsertGrowDiaryEntry = typeof growDiaryEntries.$inferInsert;

// ============================================
// Newsletter Subscribers
// ============================================
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["pending", "confirmed", "unsubscribed"]).default("pending").notNull(),
  confirmToken: varchar("confirmToken", { length: 255 }),
  unsubscribeToken: varchar("unsubscribeToken", { length: 255 }),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  unsubscribedReason: varchar("unsubscribedReason", { length: 500 }),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// ============================================
// Page Views (Internal Analytics)
// ============================================
export const pageViews = mysqlTable("pageViews", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  path: varchar("path", { length: 500 }).notNull(),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: varchar("userAgent", { length: 255 }),
  country: varchar("country", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

// ============================================
// Newsletter Campaigns
// ============================================
export const newsletterCampaigns = mysqlTable("newsletterCampaigns", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  subject: varchar("subject", { length: 255 }).notNull(),
  subjectEn: varchar("subjectEn", { length: 255 }),
  contentHtml: text("contentHtml").notNull(),
  contentHtmlEn: text("contentHtmlEn"),
  previewText: varchar("previewText", { length: 255 }),
  previewTextEn: varchar("previewTextEn", { length: 255 }),
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent"]).default("draft").notNull(),
  recipientCount: int("recipientCount").default(0),
  sentCount: int("sentCount").default(0),
  openCount: int("openCount").default(0),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;
export type InsertNewsletterCampaign = typeof newsletterCampaigns.$inferInsert;

// ============================================
// Newsletter Images (separate from gallery!)
// ============================================
export const newsletterImages = mysqlTable("newsletterImages", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("image"),
  sizeBytes: int("sizeBytes"),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterImage = typeof newsletterImages.$inferSelect;
export type InsertNewsletterImage = typeof newsletterImages.$inferInsert;

// ============================================
// Media Tags (for media library categorization)
// ============================================
export const mediaTags = mysqlTable("mediaTags", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  mediaId: bigint("mediaId", { mode: "number", unsigned: true }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaTag = typeof mediaTags.$inferSelect;
export type InsertMediaTag = typeof mediaTags.$inferInsert;
