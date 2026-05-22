import Image from "next/image";
import Link from "next/link";
import { getArticles, getStrapiMediaUrl } from "@/lib/api";
import type { Article, CategoryStripBlock } from "@/types/strapi";

interface Props {
  block: CategoryStripBlock;
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function FeaturedCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  return (
    <Link
      href={`/article/${article.slug}`}
      className="content-card group rounded-xl overflow-hidden block"
    >
      {/* Image on top */}
      <div className="relative w-full overflow-hidden" style={{ height: 180 }}>
        {hasImg ? (
          <Image
            src={img}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="hero-fallback w-full h-full" />
        )}
      </div>
      {/* Content below image */}
      <div className="p-4">
        {article.category && (
          <span className="hero-category-pill text-xs px-2 py-0.5 rounded-full font-bold mb-2 inline-block">
            {article.category.name}
          </span>
        )}
        <h3 className="content-card-title font-bold text-base line-clamp-2 leading-relaxed mt-1">
          {article.title}
        </h3>
        <p className="site-muted text-xs mt-1.5">
          {formatDate(article.published_date || article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

function SmallCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  return (
    <Link
      href={`/article/${article.slug}`}
      className="content-card group flex flex-col rounded-xl overflow-hidden transition-all"
    >
      <div className="relative w-full overflow-hidden" style={{ height: 101 }}>
        {hasImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="content-thumb-fallback w-full h-full flex items-center justify-center text-2xl">
            📖
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {article.category && (
          <span className="content-badge absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="p-2">
        <h4 className="content-card-title text-xs font-semibold line-clamp-2 transition-colors leading-relaxed">
          {article.title}
        </h4>
      </div>
    </Link>
  );
}

function SectionHeader({ name, slug, seeMoreLabel }: { name: string; slug?: string; seeMoreLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="site-section-kicker w-1.5 h-7 rounded-full" aria-hidden="true" />
        <h2 className="site-section-title text-lg font-bold">{name}</h2>
      </div>
      {slug && (
        <Link
          href={`/category/${slug}`}
          className="site-section-link text-sm font-bold flex items-center gap-1 transition-colors"
        >
          {seeMoreLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default async function CategoryStrip({ block }: Props) {
  const limit = Math.max(3, Math.min(12, block.limit ?? 7));
  const seeMoreLabel = block.see_more_label || "المزيد";
  const useFlag = block.source === "featured-flag";

  if (!useFlag && !block.category) return null;

  const headline = block.headline_ar || (useFlag ? "مختارات" : block.category!.name);
  const linkSlug = useFlag ? undefined : block.category!.slug;

  const res = useFlag
    ? await getArticles({
        showInFeaturedStrip: true,
        sortByHomepagePriority: true,
        pageSize: limit,
      })
    : await getArticles({ categorySlug: block.category!.slug, pageSize: limit, includeChildCategories: true });
  const articles = res.data ?? [];
  if (articles.length === 0) return null;

  if (block.layout === "horizontal-scroll") {
    return (
      <section aria-label={headline}>
        <SectionHeader name={headline} slug={linkSlug} seeMoreLabel={seeMoreLabel} />
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
          {articles.map((a) => (
            <div key={a.slug || a.id} className="flex-shrink-0 w-44">
              <SmallCard article={a} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.layout === "three-up") {
    return (
      <section aria-label={headline}>
        <SectionHeader name={headline} slug={linkSlug} seeMoreLabel={seeMoreLabel} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.slice(0, 3).map((a) => (
            <SmallCard key={a.slug || a.id} article={a} />
          ))}
        </div>
      </section>
    );
  }

  // Default: hero-grid (1 hero + 6 thumbs)
  const main = articles[0];
  const subs = articles.slice(1, 7);
  return (
    <section aria-label={headline}>
      <SectionHeader name={headline} slug={linkSlug} seeMoreLabel={seeMoreLabel} />
      <div className="space-y-4">
        <FeaturedCard article={main} />
        {subs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subs.map((a) => (
              <SmallCard key={a.slug || a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
