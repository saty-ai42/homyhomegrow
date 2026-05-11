import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { newsletterCampaigns, newsletterSubscribers } from "@db/schema";
import { sendNewsletterEmail } from "../lib/email";

export const newsletterCampaignRouter = createRouter({
  // List all campaigns
  list: adminQuery.query(async () => {
    const db = getDb();
    const campaigns = await db
      .select()
      .from(newsletterCampaigns)
      .orderBy(desc(newsletterCampaigns.createdAt));
    return campaigns;
  }),

  // Get single campaign
  get: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [campaign] = await db
        .select()
        .from(newsletterCampaigns)
        .where(eq(newsletterCampaigns.id, input.id));
      return campaign;
    }),

  // Create campaign
  create: adminQuery
    .input(
      z.object({
        subject: z.string().min(1).max(255),
        subjectEn: z.string().max(255).optional(),
        contentHtml: z.string().min(1),
        contentHtmlEn: z.string().optional(),
        previewText: z.string().max(255).optional(),
        previewTextEn: z.string().max(255).optional(),
        status: z.enum(["draft", "scheduled"]).optional(),
        scheduledAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [campaign] = await db
        .insert(newsletterCampaigns)
        .values({
          subject: input.subject,
          subjectEn: input.subjectEn || null,
          contentHtml: input.contentHtml,
          contentHtmlEn: input.contentHtmlEn || null,
          previewText: input.previewText || null,
          previewTextEn: input.previewTextEn || null,
          status: input.status || "draft",
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        })
        .$returningId();
      return { id: campaign.id, success: true };
    }),

  // Update campaign
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        subject: z.string().min(1).max(255).optional(),
        subjectEn: z.string().max(255).optional(),
        contentHtml: z.string().min(1).optional(),
        contentHtmlEn: z.string().optional(),
        previewText: z.string().max(255).optional(),
        previewTextEn: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.subject !== undefined) updateData.subject = data.subject;
      if (data.subjectEn !== undefined) updateData.subjectEn = data.subjectEn;
      if (data.contentHtml !== undefined) updateData.contentHtml = data.contentHtml;
      if (data.contentHtmlEn !== undefined) updateData.contentHtmlEn = data.contentHtmlEn;
      if (data.previewText !== undefined) updateData.previewText = data.previewText;
      if (data.previewTextEn !== undefined) updateData.previewTextEn = data.previewTextEn;

      await db
        .update(newsletterCampaigns)
        .set(updateData)
        .where(eq(newsletterCampaigns.id, id));
      return { success: true };
    }),

  // Delete campaign
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(newsletterCampaigns)
        .where(eq(newsletterCampaigns.id, input.id));
      return { success: true };
    }),

  // Send newsletter
  send: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get campaign
      const [campaign] = await db
        .select()
        .from(newsletterCampaigns)
        .where(eq(newsletterCampaigns.id, input.id));

      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      if (campaign.status === "sent") throw new TRPCError({ code: "BAD_REQUEST", message: "Already sent" });

      // Get confirmed subscribers
      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, "confirmed"));

      if (subscribers.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No confirmed subscribers" });
      }

      // Update status to sending
      await db
        .update(newsletterCampaigns)
        .set({
          status: "sending",
          recipientCount: subscribers.length,
        })
        .where(eq(newsletterCampaigns.id, input.id));

      // Send emails in batches (batch of 5)
      let sentCount = 0;
      let errorCount = 0;
      let lastError = "";
      const batchSize = 5;

      const SITE_URL = process.env.SITE_URL || "https://homyhomegrow.de";

      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(async (sub) => {
            try {
              await sendNewsletterEmail({
                to: sub.email,
                subject: campaign.subject,
                html: campaign.contentHtml,
                previewText: campaign.previewText || undefined,
                campaignId: campaign.id,
                unsubscribeUrl: sub.unsubscribeToken ? `${SITE_URL}/newsletter/unsubscribe?token=${sub.unsubscribeToken}` : undefined,
              });
              return true;
            } catch (e: any) {
              lastError = e.message || "Unknown error";
              console.error(`[Newsletter] Failed to send to ${sub.email}:`, e.message);
              return false;
            }
          })
        );
        sentCount += results.filter((r) => r.status === "fulfilled" && r.value).length;
        errorCount += results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value)).length;

        if (i + batchSize < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Update status (keep as draft if nothing was sent)
      await db
        .update(newsletterCampaigns)
        .set({
          status: sentCount > 0 ? "sent" : "draft",
          sentCount,
          sentAt: sentCount > 0 ? new Date() : null,
        })
        .where(eq(newsletterCampaigns.id, input.id));

      if (sentCount === 0 && lastError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No emails sent. Error: ${lastError}. Check SMTP configuration.`,
        });
      }

      return { success: true, sentCount, totalRecipients: subscribers.length, errors: errorCount };
    }),

  // Stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const campaigns = await db
      .select()
      .from(newsletterCampaigns)
      .orderBy(desc(newsletterCampaigns.createdAt));

    const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const totalRecipients = campaigns.reduce((acc, c) => acc + (c.recipientCount || 0), 0);

    return {
      totalCampaigns: campaigns.length,
      totalSent,
      totalRecipients,
      campaigns,
    };
  }),
});
