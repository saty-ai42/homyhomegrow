import { Link } from "react-router";
import { motion } from "framer-motion";
import { Youtube, BookOpen, Sprout, Camera, ArrowRight, FileText, Layers, Rss, Mail, Check, Droplets, Leaf, Mountain, Wrench } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { WebSiteSchema, OrganizationSchema } from "@/components/SchemaMarkup";

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-heading uppercase tracking-tight">
        {children}
      </h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function HeroNewsletter() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [confirmToken, setConfirmToken] = useState<string | undefined>();
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setSubscribed(true);
      if (data.token) setConfirmToken(data.token);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email });
  };

  if (subscribed) {
    return (
      <div className="mt-5 text-center">
        <div className="flex items-center justify-center gap-2 text-[#39FF14] text-sm">
          <Check size={14} />
          <span>{t("Danke! Bitte bestätige deine Email.", "Thanks! Please confirm your email.")}</span>
        </div>
        {confirmToken && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Link to={`/newsletter/confirm?token=${confirmToken}`} className="text-[#39FF14] hover:underline">
              {t("Oder hier direkt bestätigen", "Or confirm directly here")}
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2 mt-5">
      <div className="relative">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("Newsletter abonnieren...", "Subscribe to newsletter...")}
          required
          className="pl-8 pr-3 py-2 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#39FF14] transition-colors w-48 sm:w-56"
        />
      </div>
      <button
        type="submit"
        disabled={subscribeMutation.isPending}
        className="px-4 py-2 rounded-full text-sm font-medium text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors disabled:opacity-50"
      >
        {subscribeMutation.isPending ? "..." : "OK"}
      </button>
    </form>
  );
}

export default function Home() {
  const locale = useI18n((s) => s.locale);
  const t = useT();

  const blogQuery = trpc.blog.list.useQuery({ limit: 3, status: "published" });
  const guideQuery = trpc.guide.list.useQuery({ limit: 3, status: "published" });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="bg-background">
      <SEO title="HomyHomegrow" description="Deine deutschsprachige Community für Cannabis Anbau. Guides, Grow Diaries & mehr." />
      <WebSiteSchema />
      <OrganizationSchema />
      {/* Hero */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto py-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="text-xs sm:text-sm font-mono text-[#39FF14]">{t("11K+ YouTube Community", "11K+ YouTube Community")}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-heading tracking-[-0.02em] leading-[1.1] break-words">
            <span className="text-foreground">HOMYHOME</span>
            <span className="text-[#39FF14]">GROW</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            {t("Deine deutschsprachige Community für Cannabis Anbau. Von der Keimung bis zur Ernte – wir begleiten dich.", "Your German-speaking community for cannabis cultivation. From germination to harvest – we've got you covered.")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link to="/blog" className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors text-sm sm:text-base">
              <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />{t("Blog", "Blog")}
            </Link>
            <Link to="/guides" className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-foreground border border-border hover:bg-secondary transition-colors text-sm sm:text-base">
              <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />{t("Guides", "Guides")}
            </Link>
            <Link to="/tools" className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-foreground border border-border hover:bg-secondary transition-colors text-sm sm:text-base">
              <Wrench size={16} className="sm:w-[18px] sm:h-[18px]" />{t("Tools", "Tools")}
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <a href="https://www.youtube.com/@HomyHomegrow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-[#FF4444] hover:border-[#FF4444]/30 transition-all text-xs">
              <Youtube size={14} />YouTube
            </a>
            <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-[#39FF14] hover:border-[#39FF14]/30 transition-all text-xs">
              <Rss size={14} />RSS
            </a>
          </div>
          <HeroNewsletter />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center max-w-2xl mx-auto">
            {[
              { icon: Youtube, value: "11K+", label: t("YouTube Follower", "YouTube Followers") },
              { icon: Droplets, value: "Hydro", label: t("Wasseranbau", "Hydroponics") },
              { icon: Leaf, value: "Coco", label: t("Coco Coir", "Coco Coir") },
              { icon: Mountain, value: "Erde", label: t("Bio-Erde", "Organic Soil") },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <stat.icon className="w-6 h-6 text-[#FFD600] mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-[#FFD600] font-heading">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle subtitle={t("Neueste Artikel", "Latest Articles")}>{t("Blog", "Blog")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogQuery.data?.posts.map((post, i) => (
            <motion.div key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Link to={`/blog/${post.slug}`} className="group block h-full">
                <div className="h-full bg-card border border-border rounded-xl overflow-hidden hover:border-[#39FF14]/30 transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <SafeImage
                      src={post.featuredImage}
                      alt={locale === "en" ? post.titleEn : post.titleDe}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackType="blog"
                      containerClassName="w-full h-full"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">{t("Blog", "Blog")}</Badge>
                      {post.readTimeMinutes && <span className="text-xs font-mono text-muted-foreground">{post.readTimeMinutes} min</span>}
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-[#39FF14] transition-colors line-clamp-2">{locale === "en" ? post.titleEn : post.titleDe}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{locale === "en" ? post.excerptEn : post.excerptDe}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[#39FF14] hover:text-[#39FF14]/80 transition-colors font-medium">{t("Alle Artikel", "All Articles")}<ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <SectionTitle subtitle={t("Schritt-für-Schritt Anleitungen", "Step-by-Step Guides")}>{t("Grow Guides", "Grow Guides")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideQuery.data?.guides.map((guide, i) => {
            const difficultyColor = guide.difficulty === "beginner" ? "#39FF14" : guide.difficulty === "intermediate" ? "#FFD600" : "#FF4444";
            return (
              <motion.div key={guide.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/guides/${guide.slug}`} className="group block h-full">
                  <div className="h-full bg-card border border-border rounded-xl overflow-hidden hover:border-[#39FF14]/30 transition-all">
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl font-mono font-bold" style={{ color: difficultyColor }}>{String(i + 1).padStart(2, "0")}</span>
                        <Badge style={{ borderColor: difficultyColor, color: difficultyColor }} variant="outline" className="text-xs capitalize">{guide.difficulty}</Badge>
                      </div>
                      <h3 className="font-bold text-foreground group-hover:text-[#39FF14] transition-colors">{locale === "en" ? guide.titleEn : guide.titleDe}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{locale === "en" ? guide.descriptionEn : guide.descriptionDe}</p>
                      {guide.estimatedTimeMinutes && <div className="mt-3 flex items-center gap-1 text-xs font-mono text-muted-foreground"><Layers size={12} />{guide.estimatedTimeMinutes} min</div>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link to="/guides" className="inline-flex items-center gap-2 text-[#39FF14] hover:text-[#39FF14]/80 transition-colors font-medium">{t("Alle Guides", "All Guides")}<ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
          <Youtube className="w-12 h-12 text-[#FF4444] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground font-heading">{t("YouTube", "YouTube")}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("11.000+ Follower. Grow-Content, Tutorials, Strain-Reviews und mehr.", "11,000+ followers. Grow content, tutorials, strain reviews and more.")}</p>
          <a href="https://youtube.com/@HomyHomegrow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg font-bold text-white bg-[#FF4444] hover:bg-[#FF4444]/90 transition-colors"><Youtube size={18} />{t("Zum Kanal", "To Channel")}</a>
        </div>
      </section>

      {/* Community CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <div className="text-center max-w-2xl mx-auto">
          <Camera className="w-10 h-10 text-[#39FF14] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground font-heading">{t("Meine Grow Diaries", "My Grow Diaries")}</h2>
          <p className="mt-3 text-muted-foreground">{t("Dokumentiere deine Anbau-Projekte vom Start bis zur Ernte.", "Document your grow projects from start to harvest.")}</p>
          <Link to="/diary" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg font-bold text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors"><Sprout size={18} />{t("Grow Diaries", "Grow Diaries")}</Link>
        </div>
      </section>
    </div>
  );
}
