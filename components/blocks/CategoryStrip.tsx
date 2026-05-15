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
      className="group relative rounded-xl overflow-hidden block"
      style={{ height: 200 }}
    >
      {hasImg ? (
        <Image
          src={img}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-emerald-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 right-0 left-0 p-4">
        {article.category && (
          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
            {article.category.name}
          </span>
        )}
        <h3 className="text-white font-bold text-base line-clamp-2 leading-relaxed">{article.title}</h3>
        <p className="text-gray-300 text-xs mt-1">
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
      className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all bg-white"
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
          <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-2xl">
            📖
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {article.category && (
          <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="p-2">
        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-relaxed">
          {article.title}
        </h4>
      </div>
    </Link>
  );
}

function SectionHeader({ name, slug, seeMoreLabel }: { name: string; slug: string; seeMoreLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-7 bg-emerald-600 rounded-full" aria-hidden="true" />
        <h2 className="text-lg font-bold text-gray-800">{name}</h2>
      </div>
      <Link
        href={`/category/${slug}`}
        className="text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1"
      >
        {seeMoreLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}

export default async function CategoryStrip({ block }: Props) {
  if (!block.category) return null;
  const { slug, name } = block.category;
  const headline = block.headline_ar || name;
  const seeMoreLabel = block.see_more_label || "المزيد";
  const limit = Math.max(3, Math.min(12, block.limit ?? 7));

  const res = await getArticles({ categorySlug: slug, pageSize: limit });
  const articles = res.data ?? [];
  if (articles.length === 0) return null;

  if (block.layout === "horizontal-scroll") {
    return (
      <section aria-label={headline}>
        <SectionHeader name={headline} slug={slug} seeMoreLabel={seeMoreLabel} />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
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
        <SectionHeader name={headline} slug={slug} seeMoreLabel={seeMoreLabel} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      <SectionHeader name={headline} slug={slug} seeMoreLabel={seeMoreLabel} />
      <div className="space-y-3">
        <FeaturedCard article={main} />
        {subs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subs.map((a) => (
              <SmallCard key={a.slug || a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
