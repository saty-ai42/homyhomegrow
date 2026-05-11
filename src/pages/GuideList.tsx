import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Layers } from "lucide-react";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

type Difficulty = "beginner" | "intermediate" | "advanced" | "all";

const difficultyConfig = {
  beginner: { color: "#39FF14", labelDe: "Anfänger", labelEn: "Beginner" },
  intermediate: { color: "#FFD600", labelDe: "Fortgeschritten", labelEn: "Intermediate" },
  advanced: { color: "#FF4444", labelDe: "Profi", labelEn: "Advanced" },
};

export default function GuideList() {
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const [filter, setFilter] = useState<Difficulty>("all");
  const guideQuery = trpc.guide.list.useQuery({ status: "published", difficulty: filter === "all" ? undefined : filter, limit: 50 });
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Grow Guides" description="Schritt-für-Schritt Anleitungen für Cannabis Anbau. Für Anfänger bis Profis." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-heading uppercase tracking-tight">{t("Grow Guides", "Grow Guides")}</h1>
          <p className="mt-2 text-muted-foreground">{t("Schritt-für-Schritt Anleitungen für jedes Level.", "Step-by-step guides for every level.")}</p>
        </motion.div>
        <div className="flex gap-2 mb-8 flex-wrap">
          {(["all", "beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
            <button key={d} onClick={() => setFilter(d)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === d ? (d === "all" ? "bg-[#39FF14] text-[#0A0A0A]" : "text-[#0A0A0A]") : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`} style={filter === d && d !== "all" ? { backgroundColor: difficultyConfig[d].color } : undefined}>{d === "all" ? t("Alle", "All") : locale === "en" ? difficultyConfig[d].labelEn : difficultyConfig[d].labelDe}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guideQuery.data?.guides.map((guide, i) => {
            const diff = guide.difficulty as keyof typeof difficultyConfig;
            const diffColor = difficultyConfig[diff]?.color || "#39FF14";
            return (
              <motion.div key={guide.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/guides/${guide.slug}`} className="group block h-full">
                  <div className="h-full bg-card border border-border rounded-xl p-6 hover:border-[#39FF14]/30 transition-all">
                    <div className="flex items-start gap-4">
                      <span className="text-5xl font-mono font-bold shrink-0 leading-none" style={{ color: diffColor }}>{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <Badge style={{ borderColor: diffColor, color: diffColor }} variant="outline" className="mb-2 capitalize">{guide.difficulty}</Badge>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-[#39FF14] transition-colors">{locale === "en" ? guide.titleEn : guide.titleDe}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{locale === "en" ? guide.descriptionEn : guide.descriptionDe}</p>
                        {guide.estimatedTimeMinutes && <div className="mt-3 flex items-center gap-1 text-xs font-mono text-muted-foreground"><Layers size={12} />{guide.estimatedTimeMinutes} min</div>}
                        <div className="mt-3 flex items-center gap-1 text-sm text-[#39FF14]">{t("Anleitung öffnen", "Open Guide")}<ArrowRight size={14} /></div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        {guideQuery.data?.guides.length === 0 && <div className="text-center py-16"><BookOpen className="w-12 h-12 text-border mx-auto mb-4" /><p className="text-muted-foreground">{t("Keine Guides gefunden.", "No guides found.")}</p></div>}
      </div>
    </div>
  );
}
