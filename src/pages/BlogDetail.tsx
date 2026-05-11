import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import { parseContent } from "@/lib/contentParser";
import { Badge } from "@/components/ui/badge";
import SafeImage from "@/components/SafeImage";
import SEO from "@/components/SEO";
import { BlogPostingSchema, BreadcrumbSchema } from "@/components/SchemaMarkup";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const postQuery = trpc.blog.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const post = postQuery.data;

  if (postQuery.isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full" /></div>;
  if (!post) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-foreground">{t("Artikel nicht gefunden", "Article not found")}</h1><Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-[#39FF14]"><ArrowLeft size={16} />{t("Zurück zum Blog", "Back to Blog")}</Link></div></div>;

  const title = locale === "en" ? post.titleEn : post.titleDe;
  const excerpt = locale === "en" ? post.excerptEn : post.excerptDe;
  const content = locale === "en" ? post.contentEn : post.contentDe;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={title}
        description={excerpt || `${title} | HomyHomegrow Blog`}
        image={post.featuredImage || undefined}
        type="article"
        publishedAt={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}
        updatedAt={post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined}
        keywords="cannabis, anbau, grow, blog, guide"
      />
      <BlogPostingSchema
        title={title}
        description={excerpt || `${title} | HomyHomegrow Blog`}
        slug={post.slug}
        image={post.featuredImage}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        keywords="cannabis, anbau, grow, blog, guide"
        locale={locale}
      />
      <BreadcrumbSchema items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: title, path: `/blog/${post.slug}` }]} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#39FF14] transition-colors mb-6"><ArrowLeft size={16} />{t("Zurück zum Blog", "Back to Blog")}</Link>
          {post.category && <Badge variant="outline" className="mb-4 border-[#39FF14]/30 text-[#39FF14]">{locale === "en" ? post.category.nameEn : post.category.nameDe}</Badge>}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-heading tracking-tight leading-tight">{title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            {post.publishedAt && <span className="flex items-center gap-1"><Calendar size={14} />{new Date(post.publishedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</span>}
            {post.readTimeMinutes && <span className="flex items-center gap-1 font-mono"><Clock size={14} />{post.readTimeMinutes} min</span>}
          </div>
          {post.featuredImage && <div className="mt-8 rounded-xl overflow-hidden border border-border"><SafeImage src={post.featuredImage} alt={title} className="w-full max-h-[500px] object-cover" containerClassName="w-full" /></div>}
          {excerpt && <p className="mt-8 text-lg text-muted-foreground leading-relaxed border-l-2 border-[#39FF14] pl-4">{excerpt}</p>}
          {content && <article className="mt-8 prose prose-invert max-w-none">{parseContent(content)}</article>}
          {post.images && post.images.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-foreground font-heading mb-4">{t("Galerie", "Gallery")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{post.images.map((img, i) => <div key={i} className="rounded-lg overflow-hidden border border-border"><img src={img} alt={`${title} - ${i + 1}`} className="w-full h-40 object-cover hover:scale-105 transition-transform" /></div>)}</div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
