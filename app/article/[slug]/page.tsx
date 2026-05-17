import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, getArticles, getRelatedArticles, getStrapiMediaUrl } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd, type SchemaNode } from "@/lib/seo/schema/core";
import { buildBlogPosting } from "@/lib/seo/schema/blog-posting";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";
import { buildFAQPage } from "@/lib/seo/schema/faq-page";
import ArticleCard from "@/components/blog/ArticleCard";
import QuickAnswer from "@/components/article/QuickAnswer";
import FAQList from "@/components/article/FAQList";
import Sources from "@/components/article/Sources";
import { addHeadingAnchors } from "@/lib/article/headings";
import { sanitizeArticleBody } from "@/lib/article/sanitize";
import { worldForCategory, worldLabel, worldHref } from "@/lib/editorial/worlds";

const SITE_URL = getSiteUrl();

interface Props {
  params: { slug: string };
}

// Placeholders that leak from preview/template content and should never render.
const RESERVED_SLUGS = new Set(["article", "preview", "test", "undefined", "null"]);

export async function generateStaticParams() {
  try {
    const { data: articles } = await getArticles({ pageSize: 100 });
    return articles
      .filter((a) => !RESERVED_SLUGS.has(a.slug))
      .map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (RESERVED_SLUGS.has(params.slug)) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article Not Found" };

  const { title, excerpt, seo, featured_image, author_name, published_date } = article;
  const ogImage = seo?.og_image?.url || featured_image?.url;
  const canonical = `${SITE_URL}/article/${params.slug}`;

  return {
    title: seo?.meta_title || title,
    description: seo?.meta_description || excerpt,
    authors: [{ name: author_name }],
    alternates: { canonical },
    robots: seo?.no_index ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: seo?.meta_title || title,
      description: seo?.meta_description || excerpt,
      url: canonical,
      publishedTime: published_date,
      authors: [author_name],
      images: ogImage ? [{ url: getStrapiMediaUrl(ogImage), width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.meta_title || title,
      description: seo?.meta_description || excerpt,
      images: ogImage ? [getStrapiMediaUrl(ogImage)] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  if (RESERVED_SLUGS.has(params.slug)) notFound();
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const {
    title, content, excerpt, quickAnswer, featured_image, category,
    author_name, author_image, published_date, reading_time,
    lastReviewedAt, faqs, sources,
  } = article;

  const imageUrl = featured_image?.url;
  const imageAlt = featured_image?.alternativeText || title;
  const authorImgUrl = author_image?.url;

  const formattedDate = new Date(published_date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const formattedReviewedDate = lastReviewedAt
    ? new Date(lastReviewedAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  const { html: anchoredContent } = addHeadingAnchors(sanitizeArticleBody(content));

  let relatedArticles: Awaited<ReturnType<typeof getRelatedArticles>> = [];
  if (category?.slug) {
    relatedArticles = await getRelatedArticles(category.slug, params.slug, 3);
  }

  const world = worldForCategory(category?.slug);
  const breadcrumbs: { name: string; url: string }[] = [
    { name: "Home", url: SITE_URL },
  ];
  if (world) {
    breadcrumbs.push({
      name: worldLabel(world, "en"),
      url: `${SITE_URL}${worldHref(world)}`,
    });
  } else {
    breadcrumbs.push({ name: "Blog", url: `${SITE_URL}/blog` });
  }
  if (category) {
    breadcrumbs.push({ name: category.name, url: `${SITE_URL}/category/${category.slug}` });
  }
  breadcrumbs.push({ name: title, url: `${SITE_URL}/article/${params.slug}` });

  const articleUrl = `${SITE_URL}/article/${params.slug}`;
  const faqPageId = faqs && faqs.length > 0 ? `${articleUrl}#faq` : undefined;
  const faqNode = faqs && faqPageId ? buildFAQPage(faqs, faqPageId) : null;

  const graph: SchemaNode[] = [
    buildBlogPosting(article, { faqPageId: faqNode ? faqPageId : undefined }),
    buildBreadcrumb(breadcrumbs),
  ];
  if (faqNode) graph.push(faqNode);

  return (
    <>
      <JsonLd graph={graph} />

      <article>
        <header className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-6">
            <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <span>/</span>
              {world ? (
                <Link href={worldHref(world)} className="hover:text-gray-700 transition-colors">
                  {worldLabel(world, "en")}
                </Link>
              ) : (
                <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
              )}
              {category && (
                <>
                  <span>/</span>
                  <Link href={`/category/${category.slug}`} className="hover:text-gray-700 transition-colors">
                    {category.name}
                  </Link>
                </>
              )}
            </nav>

            {category && (
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors mb-4"
              >
                {category.name}
              </Link>
            )}

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl leading-tight text-balance">
              {title}
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">{excerpt}</p>

            <div className="mt-8 flex items-center gap-4">
              {authorImgUrl ? (
                <Image
                  src={getStrapiMediaUrl(authorImgUrl)}
                  alt={author_name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  {author_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{author_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <time dateTime={published_date}>{formattedDate}</time>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span>{reading_time} min read</span>
                </div>
                {formattedReviewedDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Last reviewed:{" "}
                    <time dateTime={lastReviewedAt!}>{formattedReviewedDate}</time>
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {imageUrl && (
          <div className="mx-auto max-w-5xl px-6 mb-12">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={getStrapiMediaUrl(imageUrl)}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 100vw, 1100px"
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-6 pb-12">
          {quickAnswer && <QuickAnswer answer={quickAnswer} />}
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: anchoredContent }} />
        </div>

        {faqs && faqs.length > 0 && <FAQList faqs={faqs} />}
        {sources && sources.length > 0 && <Sources sources={sources} />}
      </article>

      {relatedArticles.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50/50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-10">Related Articles</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
