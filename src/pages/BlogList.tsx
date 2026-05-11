import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Search, ArrowRight, FileText } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

export default function BlogList() {
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  const blogQuery = trpc.blog.list.useQuery({ status: "published", search: search || undefined, limit: 20 });
  const categoryQuery = trpc.category.list.useQuery();

  const filteredPosts = selectedCategory ? blogQuery.data?.posts.filter((p) => p.categoryId === selectedCategory) : blogQuery.data?.posts;

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Blog" description="Neues aus der Grow-Welt. Guides, Tips und Community Stories." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-heading uppercase tracking-tight">{t("Blog", "Blog")}</h1>
          <p className="mt-2 text-muted-foreground">{t("Neues aus der Grow-Welt.", "Latest from the grow world.")}</p>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("Suchen...", "Search...")} className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedCategory(undefined)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!selectedCategory ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}>{t("Alle", "All")}</button>
            {categoryQuery.data?.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat.id ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}>{locale === "en" ? cat.nameEn : cat.nameDe}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts?.map((post, i) => (
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
                      {post.categoryId && <Badge variant="outline" className="text-xs border-border text-muted-foreground">{locale === "en" ? categoryQuery.data?.find((c) => c.id === post.categoryId)?.nameEn : categoryQuery.data?.find((c) => c.id === post.categoryId)?.nameDe}</Badge>}
                      {post.readTimeMinutes && <span className="text-xs font-mono text-muted-foreground">{post.readTimeMinutes} min</span>}
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-[#39FF14] transition-colors line-clamp-2">{locale === "en" ? post.titleEn : post.titleDe}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{locale === "en" ? post.excerptEn : post.excerptDe}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm text-[#39FF14]">{t("Weiterlesen", "Read more")}<ArrowRight size={14} /></div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        {filteredPosts?.length === 0 && <div className="text-center py-16"><FileText className="w-12 h-12 text-border mx-auto mb-4" /><p className="text-muted-foreground">{t("Keine Artikel gefunden.", "No articles found.")}</p></div>}
      </div>
    </div>
  );
}
