import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { parseContent } from "@/lib/contentParser";
import { Badge } from "@/components/ui/badge";
import SafeImage from "@/components/SafeImage";
import SEO from "@/components/SEO";
import { HowToSchema, BreadcrumbSchema } from "@/components/SchemaMarkup";

const difficultyConfig = {
  beginner: { color: "#39FF14", labelDe: "Anfänger", labelEn: "Beginner" },
  intermediate: { color: "#FFD600", labelDe: "Fortgeschritten", labelEn: "Intermediate" },
  advanced: { color: "#FF4444", labelDe: "Profi", labelEn: "Advanced" },
};

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const guideQuery = trpc.guide.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const guide = guideQuery.data;

  if (guideQuery.isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full" /></div>;
  if (!guide) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-foreground">{t("Guide nicht gefunden", "Guide not found")}</h1><Link to="/guides" className="mt-4 inline-flex items-center gap-2 text-[#39FF14]"><ArrowLeft size={16} />{t("Zurück zu Guides", "Back to Guides")}</Link></div></div>;

  const diff = guide.difficulty as keyof typeof difficultyConfig;
  const diffColor = difficultyConfig[diff]?.color || "#39FF14";
  const title = locale === "en" ? guide.titleEn : guide.titleDe;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={title}
        description={locale === "en" ? (guide.descriptionEn || `${title} | HomyHomegrow Guides`) : (guide.descriptionDe || `${title} | HomyHomegrow Guides`)}
        image={guide.featuredImage || undefined}
        type="article"
        keywords="cannabis, anbau, grow, guide, tutorial"
      />
      <HowToSchema
        title={title}
        description={locale === "en" ? (guide.descriptionEn || title) : (guide.descriptionDe || title)}
        slug={guide.slug}
        steps={guide.steps?.map((s) => ({
          title: locale === "en" ? s.titleEn : s.titleDe,
          content: locale === "en" ? s.contentEn : s.contentDe,
          stepNumber: s.stepNumber,
        })) || []}
        totalTime={guide.estimatedTimeMinutes ? `PT${guide.estimatedTimeMinutes}M` : undefined}
        difficulty={guide.difficulty}
        image={guide.featuredImage}
      />
      <BreadcrumbSchema items={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: title, path: `/guides/${guide.slug}` }]} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/guides" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#39FF14] transition-colors mb-6"><ArrowLeft size={16} />{t("Zurück zu Guides", "Back to Guides")}</Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge style={{ borderColor: diffColor, color: diffColor }} variant="outline" className="capitalize">{diff}</Badge>
            {guide.estimatedTimeMinutes && <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground"><Clock size={12} />{guide.estimatedTimeMinutes} min</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-heading tracking-tight leading-tight">{title}</h1>
          {(locale === "en" ? guide.descriptionEn : guide.descriptionDe) && <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{locale === "en" ? guide.descriptionEn : guide.descriptionDe}</p>}
          {guide.featuredImage && <div className="mt-8 rounded-xl overflow-hidden border border-border"><SafeImage src={guide.featuredImage} alt={title} className="w-full max-h-[400px] object-cover" containerClassName="w-full" /></div>}
          {(locale === "en" ? guide.contentEn : guide.contentDe) && <article className="mt-8 prose prose-invert max-w-none">{parseContent(locale === "en" ? guide.contentEn : guide.contentDe)}</article>}
          {guide.steps && guide.steps.length > 0 && (
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold text-foreground font-heading">{t("Schritte", "Steps")}</h2>
              {guide.steps.map((step) => {
                const stepTitle = locale === "en" ? step.titleEn : step.titleDe;
                const stepContent = locale === "en" ? step.contentEn : step.contentDe;
                return (
                  <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl font-mono font-bold shrink-0" style={{ color: diffColor }}>{String(step.stepNumber).padStart(2, "0")}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{stepTitle}</h3>
                        {stepContent && <div className="mt-2 text-muted-foreground">{parseContent(stepContent)}</div>}
                        {step.images && step.images.length > 0 && <div className="grid grid-cols-2 gap-3 mt-4">{step.images.map((img, i) => <SafeImage key={i} src={img} alt={`${stepTitle} - ${i + 1}`} className="rounded-lg border border-border object-cover h-32 w-full" containerClassName="w-full" />)}</div>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
