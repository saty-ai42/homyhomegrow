import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { useI18n } from "@/stores/i18nStore";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
  keywords?: string;
}

const SITE_URL = "https://homyhomegrow.de";
const DEFAULT_IMAGE = "/images/hero-bg.jpg";
const DEFAULT_DESCRIPTION = "Deine deutschsprachige Community für Cannabis Anbau. Guides, Grow Diaries & mehr.";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = "website",
  publishedAt,
  updatedAt,
  keywords,
}: SEOProps) {
  const location = useLocation();
  const locale = useI18n((s) => s.locale);
  const canonicalUrl = `${SITE_URL}${location.pathname}`;
  const fullTitle = title.includes("HomyHomegrow") ? title : `${title} | HomyHomegrow`;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title="HomyHomegrow Blog RSS" href={`${SITE_URL}/api/rss.xml`} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta property="og:site_name" content="HomyHomegrow" />
      <meta property="og:locale" content={locale === "en" ? "en_US" : "de_DE"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />

      {/* Article specific */}
      {type === "article" && publishedAt && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
        </>
      )}
    </Helmet>
  );
}
