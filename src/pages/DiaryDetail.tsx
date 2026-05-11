import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Thermometer, Droplets } from "lucide-react";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { parseContent } from "@/lib/contentParser";
import { Badge } from "@/components/ui/badge";
import SafeImage from "@/components/SafeImage";
import SEO from "@/components/SEO";
import { BlogPostingSchema, BreadcrumbSchema } from "@/components/SchemaMarkup";

const statusConfig: Record<string, { color: string; labelDe: string; labelEn: string }> = {
  germination: { color: "#39FF14", labelDe: "Keimung", labelEn: "Germination" },
  vegetative: { color: "#39FF14", labelDe: "Wachstum", labelEn: "Vegetative" },
  flowering: { color: "#FFD600", labelDe: "Blüte", labelEn: "Flowering" },
  harvesting: { color: "#FF4444", labelDe: "Ernte", labelEn: "Harvesting" },
  curing: { color: "#8A8A8A", labelDe: "Curing", labelEn: "Curing" },
  completed: { color: "#8A8A8A", labelDe: "Abgeschlossen", labelEn: "Completed" },
};

export default function DiaryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const diaryQuery = trpc.diary.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const diary = diaryQuery.data;

  if (diaryQuery.isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full" /></div>;
  if (!diary) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-foreground">{t("Diary nicht gefunden", "Diary not found")}</h1><Link to="/diary" className="mt-4 inline-flex items-center gap-2 text-[#39FF14]"><ArrowLeft size={16} />{t("Zurück zu Diaries", "Back to Diaries")}</Link></div></div>;

  const status = statusConfig[diary.status] || statusConfig.germination;
  const strainName = locale === "en" ? diary.strainNameEn : diary.strainNameDe;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={strainName}
        description={locale === "en" ? (diary.descriptionEn || `${strainName} - Grow Diary`) : (diary.descriptionDe || `${strainName} - Grow Diary`)}
        image={diary.featuredImage || undefined}
        type="article"
        keywords="cannabis, grow diary, anbau, strain, grow log"
      />
      <BlogPostingSchema
        title={strainName}
        description={locale === "en" ? (diary.descriptionEn || `${strainName} - Grow Diary`) : (diary.descriptionDe || `${strainName} - Grow Diary`)}
        slug={diary.slug}
        image={diary.featuredImage}
        publishedAt={diary.startDate}
        keywords="cannabis, grow diary, anbau, strain, grow log"
        locale={locale}
      />
      <BreadcrumbSchema items={[{ name: "Home", path: "/" }, { name: "Grow Diaries", path: "/diary" }, { name: strainName, path: `/diary/${diary.slug}` }]} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/diary" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#39FF14] transition-colors mb-6"><ArrowLeft size={16} />{t("Zurück zu Diaries", "Back to Diaries")}</Link>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge style={{ backgroundColor: `${status.color}20`, color: status.color, borderColor: `${status.color}30` }}>{locale === "en" ? status.labelEn : status.labelDe}</Badge>
            <Badge variant="outline" className="text-muted-foreground border-border">{diary.growMethod}</Badge>
            <Badge variant="outline" className="text-muted-foreground border-border">{diary.seedType}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-heading tracking-tight">{strainName}</h1>
          {diary.breeder && <p className="mt-2 text-muted-foreground">{diary.breeder}</p>}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar size={14} />{diary.dayCount || 0} {t("Tage", "days")}</span>
            {diary.startDate && <span>{new Date(diary.startDate).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</span>}
          </div>
          {diary.featuredImage && <div className="mt-8 rounded-xl overflow-hidden border border-border"><SafeImage src={diary.featuredImage} alt={strainName} className="w-full max-h-[400px] object-cover" containerClassName="w-full" /></div>}
          {(locale === "en" ? diary.descriptionEn : diary.descriptionDe) && <p className="mt-8 text-lg text-muted-foreground leading-relaxed">{locale === "en" ? diary.descriptionEn : diary.descriptionDe}</p>}
          {diary.entries && diary.entries.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground font-heading mb-6">{t("Grow Timeline", "Grow Timeline")}</h2>
              <div className="space-y-6">
                {diary.entries.map((entry) => {
                  const entryTitle = locale === "en" ? entry.titleEn : entry.titleDe;
                  const entryContent = locale === "en" ? entry.contentEn : entry.contentDe;
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative pl-8 border-l-2 border-border">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2" style={{ borderColor: status.color, backgroundColor: "hsl(var(--background))" }} />
                      <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono font-bold text-[#39FF14]">{t("Tag", "Day")} {entry.day}</span>
                          {entry.week && <span className="text-xs font-mono text-muted-foreground">{t("Woche", "Week")} {entry.week}</span>}
                        </div>
                        <h3 className="font-bold text-foreground">{entryTitle}</h3>
                        {entryContent && <div className="mt-2 text-muted-foreground">{parseContent(entryContent)}</div>}
                        <div className="flex flex-wrap gap-3 mt-3 text-xs font-mono text-muted-foreground">
                          {entry.humidity != null && <span className="flex items-center gap-1"><Droplets size={12} />{entry.humidity}%</span>}
                          {entry.temperature != null && <span className="flex items-center gap-1"><Thermometer size={12} />{entry.temperature}°C</span>}
                          {entry.waterAmount != null && <span>{entry.waterAmount}ml {t("Wasser", "water")}</span>}
                        </div>
                        {entry.images && entry.images.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">{entry.images.map((img, i) => <SafeImage key={i} src={img} alt={`${entryTitle} - ${i + 1}`} className="rounded-lg border border-border object-cover h-24 w-full" containerClassName="w-full" />)}</div>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
