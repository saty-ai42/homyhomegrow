/**
 * Schema.org JSON-LD Structured Data for Rich Snippets and LLM comprehension.
 * Supports: WebSite, BlogPosting, Article, HowTo, BreadcrumbList, Organization
 */

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function WebSiteSchema({
  name = "HomyHomegrow",
  url = "https://homyhomegrow.de",
  description = "Deine deutschsprachige Community fuer Cannabis Anbau. Guides, Grow Diaries und mehr.",
}: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BlogPostingSchemaProps {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string;
  keywords?: string;
  locale?: string;
}

export function BlogPostingSchema({
  title,
  description,
  slug,
  image,
  publishedAt,
  updatedAt,
  authorName = "HomyHomegrow",
  keywords,
  locale = "de",
}: BlogPostingSchemaProps) {
  const url = `https://homyhomegrow.de/blog/${slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "HomyHomegrow",
      logo: {
        "@type": "ImageObject",
        url: "https://homyhomegrow.de/images/hero-bg.jpg",
      },
    },
    inLanguage: locale === "en" ? "en" : "de",
  };

  if (image) {
    schema.image = `https://homyhomegrow.de${image}`;
  }

  if (publishedAt) {
    schema.datePublished = new Date(publishedAt).toISOString();
  }

  if (updatedAt) {
    schema.dateModified = new Date(updatedAt).toISOString();
  }

  if (keywords) {
    schema.keywords = keywords;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface HowToSchemaProps {
  title: string;
  description: string;
  slug: string;
  steps: Array<{
    title: string;
    content?: string | null;
    stepNumber: number;
  }>;
  totalTime?: string;
  difficulty?: string;
  image?: string | null;
}

export function HowToSchema({
  title,
  description,
  slug,
  steps,
  totalTime,
  difficulty,
  image,
}: HowToSchemaProps) {
  const url = `https://homyhomegrow.de/guides/${slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    url,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      position: step.stepNumber,
      name: step.title,
      text: step.content || step.title,
    })),
    totalTime: totalTime || "PT30M",
    author: {
      "@type": "Organization",
      name: "HomyHomegrow",
    },
  };

  if (difficulty) {
    schema.estimatedCost = {
      "@type": "MonetaryAmount",
      value: difficulty,
      currency: "EUR",
    };
  }

  if (image) {
    schema.image = `https://homyhomegrow.de${image}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; path: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://homyhomegrow.de${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
}

export function OrganizationSchema({
  name = "HomyHomegrow",
  url = "https://homyhomegrow.de",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: `${url}/images/hero-bg.jpg`,
    sameAs: [
      "https://www.youtube.com/@HomyHomegrow",
    ],
    description:
      "Deine deutschsprachige Community fuer Cannabis Anbau. 11K+ YouTube Follower.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
