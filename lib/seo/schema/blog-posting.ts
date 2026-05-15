import type { Article, SourceCitation } from "@/types/strapi";
import { getStrapiMediaUrl } from "@/lib/api";
import { getSiteUrl } from "../site";
import { SCHEMA_IDS, type SchemaNode } from "./core";

const HEADLINE_MAX = 110;

function truncateHeadline(title: string, max = HEADLINE_MAX): string {
  return title.length <= max ? title : title.slice(0, max - 1) + "…";
}

/**
 * Articles can mark their content language by wrapping the body in
 * <article lang="en">…</article>. Default is Arabic (the platform default).
 */
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

function buildCitations(sources: SourceCitation[] | undefined): SchemaNode[] {
  if (!sources?.length) return [];
  return sources
    .filter((s) => s.label?.trim())
    .map((s) => {
      const entry: SchemaNode = {
        "@type": "CreativeWork",
        name: s.label.trim(),
      };
      if (s.url?.trim()) entry.url = s.url.trim();
      if (s.reference?.trim()) entry.description = s.reference.trim();
      return entry;
    });
}

interface BuildBlogPostingOptions {
  faqPageId?: string;
}

/**
 * BlogPosting node for an article page. Author and publisher both reference
 * the site Organization by @id (editorial byline). When the Author content
 * type lands, this builder will accept an optional author Person node.
 */
export function buildBlogPosting(
  article: Article,
  options: BuildBlogPostingOptions = {},
): SchemaNode {
  const siteUrl = getSiteUrl();
  const canonicalUrl = article.seo?.canonical_url || `${siteUrl}/article/${article.slug}`;
  const description = article.seo?.meta_description || article.excerpt;

  const node: SchemaNode = {
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    headline: truncateHeadline(article.title),
    description,
    datePublished: article.publishedAt,
    dateModified: article.lastReviewedAt || article.updatedAt,
    author: { "@id": SCHEMA_IDS.organization },
    publisher: { "@id": SCHEMA_IDS.organization },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    inLanguage: detectInLanguage(article.content),
  };

  if (article.quickAnswer?.trim()) {
    node.abstract = article.quickAnswer.trim();
  }

  if (article.category?.name) {
    node.articleSection = article.category.name;
  }

  if (article.featured_image?.url) {
    const img: SchemaNode = {
      "@type": "ImageObject",
      url: getStrapiMediaUrl(article.featured_image.url),
    };
    if (article.featured_image.width) img.width = article.featured_image.width;
    if (article.featured_image.height) img.height = article.featured_image.height;
    if (article.featured_image.alternativeText) {
      img.caption = article.featured_image.alternativeText;
    }
    node.image = [img];
  }

  const wordCount = estimateWordCount(article.content);
  if (wordCount > 0) node.wordCount = wordCount;

  const citations = buildCitations(article.sources);
  if (citations.length > 0) node.citation = citations;

  if (options.faqPageId) {
    node.mainEntity = { "@id": options.faqPageId };
  }

  return node;
}
