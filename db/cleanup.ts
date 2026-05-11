import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";
import { blogPosts } from "./schema";
import { eq } from "drizzle-orm";

async function cleanup() {
  const db = getDb();
  console.log("Cleaning up database...");

  // Remove bad "Test" blog posts
  const deleted = await db
    .delete(blogPosts)
    .where(eq(blogPosts.slug, "test"));
  console.log("Removed 'test' blog posts");

  // Show current blog posts
  const posts = await db.select({ id: blogPosts.id, slug: blogPosts.slug, titleDe: blogPosts.titleDe }).from(blogPosts);
  console.log("Current blog posts:", posts);

  console.log("Cleanup complete!");
}

cleanup().catch(console.error);
