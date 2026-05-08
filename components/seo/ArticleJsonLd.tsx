import type { Article } from "@/types/strapi";
import { getStrapiMediaUrl } from "@/lib/api";

interface Props {
  article: Article;
  siteUrl: string;
}

const PUBLISHER_NAME = "إسلام 24";
const PUBLISHER_LOGO_URL =
  "https://res.cloudinary.com/dcnvz21jt/image/upload/v1778254210/islam_24_logo_7e6cebc72b.webp";
// Google's Article structured data spec: logo should fit within a 60x600 area.
const PUBLISHER_LOGO_WIDTH = 600;
const PUBLISHER_LOGO_HEIGHT = 60;

const HEADLINE_MAX = 110;

function truncateHeadline(title: string, max = HEADLINE_MAX): string {
  return title.length <= max ? title : title.slice(0, max - 1) + "…";
}

function detectInLanguage(content: string | null | undefined): "ar" | "en" {
  if (!content) return "ar";
  const m = content.match(/<article[^>]*\blang="([a-zA-Z-]+)"/i);
  if (m && m[1].toLowerCase().startsWith("en")) return "en";
  return "ar";
}

function estimateWordCount(html: string | null | undefined): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

export default function ArticleJsonLd({ article, siteUrl }: Props) {
  const {
    title,
    excerpt,
    slug,
    content,
    featured_image,
    category,
    publishedAt,
    updatedAt,
    seo,
  } = article;

  const canonicalUrl = seo?.canonical_url || `${siteUrl}/article/${slug}`;
  const description = seo?.meta_description || excerpt;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: truncateHeadline(title),
    description,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: PUBLISHER_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: PUBLISHER_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO_URL,
        width: PUBLISHER_LOGO_WIDTH,
        height: PUBLISHER_LOGO_HEIGHT,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    inLanguage: detectInLanguage(content),
  };

  if (category?.name) {
    ld.articleSection = category.name;
  }

  if (featured_image?.url) {
    const img: Record<string, unknown> = {
      "@type": "ImageObject",
      url: getStrapiMediaUrl(featured_image.url),
    };
    if (featured_image.width) img.width = featured_image.width;
    if (featured_image.height) img.height = featured_image.height;
    if (featured_image.alternativeText) {
      img.caption = featured_image.alternativeText;
    }
    ld.image = [img];
  }

  const wordCount = estimateWordCount(content);
  if (wordCount > 0) ld.wordCount = wordCount;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
