import { relations } from "drizzle-orm";
import {
  categories,
  blogPosts,
  guides,
  guideSteps,
  growDiaries,
  growDiaryEntries,
} from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
  blogPosts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  category: one(categories, {
    fields: [blogPosts.categoryId],
    references: [categories.id],
  }),
}));

export const guidesRelations = relations(guides, ({ many }) => ({
  steps: many(guideSteps),
}));

export const guideStepsRelations = relations(guideSteps, ({ one }) => ({
  guide: one(guides, {
    fields: [guideSteps.guideId],
    references: [guides.id],
  }),
}));

export const growDiariesRelations = relations(growDiaries, ({ many }) => ({
  entries: many(growDiaryEntries),
}));

export const growDiaryEntriesRelations = relations(growDiaryEntries, ({ one }) => ({
  diary: one(growDiaries, {
    fields: [growDiaryEntries.diaryId],
    references: [growDiaries.id],
  }),
}));
