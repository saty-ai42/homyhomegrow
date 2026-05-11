import { Link } from "react-router";
import { motion } from "framer-motion";
import { Sprout, Calendar } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

const statusConfig: Record<string, { color: string; labelDe: string; labelEn: string }> = {
  germination: { color: "#39FF14", labelDe: "Keimung", labelEn: "Germination" },
  vegetative: { color: "#39FF14", labelDe: "Wachstum", labelEn: "Vegetative" },
  flowering: { color: "#FFD600", labelDe: "Blüte", labelEn: "Flowering" },
  harvesting: { color: "#FF4444", labelDe: "Ernte", labelEn: "Harvesting" },
  curing: { color: "#8A8A8A", labelDe: "Curing", labelEn: "Curing" },
  completed: { color: "#8A8A8A", labelDe: "Abgeschlossen", labelEn: "Completed" },
};

const seedTypeLabels: Record<string, { de: string; en: string }> = {
  feminized: { de: "Feminisiert", en: "Feminized" },
  regular: { de: "Regular", en: "Regular" },
  autoflowering: { de: "Autoflowering", en: "Autoflowering" },
  clone: { de: "Klon", en: "Clone" },
};

export default function DiaryList() {
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const diaryQuery = trpc.diary.list.useQuery({});
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Grow Diaries" description="Dokumentierte Grows von der Keimung bis zur Ernte. Follow my grow journey." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-heading uppercase tracking-tight">{t("Grow Diaries", "Grow Diaries")}</h1>
          <p className="mt-2 text-muted-foreground">{t("Dokumentierte Grows vom Start bis zur Ernte.", "Documented grows from start to harvest.")}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diaryQuery.data?.diaries.map((diary, i) => {
            const status = statusConfig[diary.status] || statusConfig.germination;
            const seedType = seedTypeLabels[diary.seedType] || seedTypeLabels.feminized;
            return (
              <motion.div key={diary.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/diary/${diary.slug}`} className="group block h-full">
                  <div className="h-full bg-card border border-border rounded-xl overflow-hidden hover:border-[#39FF14]/30 transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      <SafeImage
                        src={diary.featuredImage}
                        alt={locale === "en" ? diary.strainNameEn : diary.strainNameDe}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackType="diary"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-mono font-bold" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{locale === "en" ? status.labelEn : status.labelDe}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground group-hover:text-[#39FF14] transition-colors">{locale === "en" ? diary.strainNameEn : diary.strainNameDe}</h3>
                      {diary.breeder && <p className="text-sm text-muted-foreground">{diary.breeder}</p>}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">{locale === "en" ? seedType.en : seedType.de}</Badge>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">{diary.growMethod}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs font-mono text-muted-foreground"><span className="flex items-center gap-1"><Calendar size={12} />{diary.dayCount || 0} {t("Tage", "days")}</span></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        {diaryQuery.data?.diaries.length === 0 && <div className="text-center py-16"><Sprout className="w-12 h-12 text-border mx-auto mb-4" /><p className="text-muted-foreground">{t("Keine Diaries gefunden.", "No diaries found.")}</p></div>}
      </div>
    </div>
  );
}
