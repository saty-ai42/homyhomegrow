import { motion } from "framer-motion";
import { Youtube, Users, BookOpen, Sprout, Heart } from "lucide-react";
import { useT } from "@/stores/i18nStore";
import SEO from "@/components/SEO";
import { OrganizationSchema } from "@/components/SchemaMarkup";


export default function About() {
  const t = useT();
  const topics = [
    { icon: Sprout, title: "Cannabis Anbau", desc: "Von der Keimung bis zur Ernte" },
    { icon: BookOpen, title: "Strain Reviews", desc: "Detaillierte Sortenanalysen" },
    { icon: Users, title: "Community", desc: "Austausch mit anderen Growern" },
    { icon: Youtube, title: "Video Content", desc: "Tutorials auf YouTube" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Über uns" description="Deine deutschsprachige Community für Cannabis Anbau. 11K+ YouTube Follower." />
      <OrganizationSchema />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-heading uppercase tracking-tight">{t("Über uns", "About Us")}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t("HomyHomegrow ist eine deutschsprachige Community rund um den Cannabis-Anbau. Wir teilen Wissen, Erfahrungen und begleiten dich auf deinem Grow-Journey.", "HomyHomegrow is a German-speaking community around cannabis cultivation. We share knowledge, experiences and accompany you on your grow journey.")}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ icon: Youtube, value: "11K+", label: "YouTube" }, { icon: BookOpen, value: "50+", label: t("Guides", "Guides") }, { icon: Users, value: "5K+", label: t("Community", "Community") }, { icon: Sprout, value: "100%", label: t("Passion", "Passion") }].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-6 text-center">
              <stat.icon className="w-6 h-6 text-[#FFD600] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#FFD600] font-heading">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
          <h2 className="text-2xl font-bold text-foreground font-heading mb-6">{t("Themen", "Topics")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div key={topic.title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5">
                <div className="p-2 rounded-lg bg-[#39FF14]/10 shrink-0"><topic.icon className="w-5 h-5 text-[#39FF14]" /></div>
                <div><h3 className="font-bold text-foreground">{topic.title}</h3><p className="text-sm text-muted-foreground">{topic.desc}</p></div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 bg-card border border-border rounded-xl p-8 text-center">
          <Heart className="w-8 h-8 text-[#39FF14] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground font-heading">{t("YouTube", "YouTube")}</h2>
          <p className="mt-2 text-muted-foreground">{t("Werde Teil der Community.", "Become part of the community.")}</p>
          <div className="flex justify-center mt-6">
            <a href="https://youtube.com/@HomyHomegrow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF4444] text-white hover:bg-[#FF4444]/90 transition-colors font-bold"><Youtube size={20} />YouTube</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
