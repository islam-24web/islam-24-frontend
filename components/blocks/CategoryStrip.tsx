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

/** Standard 4-up article card — image top, title + date below, no card shell */
function ArticleCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  return (
    <Link href={`/article/${article.slug}`} className="group flex flex-col">
      {/* 16:9 image */}
      <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-3">
        {hasImg ? (
          <Image
            src={img}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="content-thumb-fallback w-full h-full rounded-xl flex items-center justify-center text-3xl">📖</div>
        )}
      </div>
      {/* Title */}
      <h3 className="content-card-title text-sm font-bold line-clamp-3 leading-relaxed group-hover:text-[color:var(--site-accent)] transition-colors">
        {article.title}
      </h3>
      {/* Date */}
      <span className="site-muted text-[10px] mt-1.5 block">
        {formatDate(article.published_date || article.publishedAt)}
      </span>
    </Link>
  );
}

/** Compact horizontal-scroll card (unchanged) */
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
          <div className="content-thumb-fallback w-full h-full flex items-center justify-center text-2xl">📖</div>
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

/**
 * Section header — category name is a clickable link.
 * The kicker bar + name + chevron all navigate to the category page.
 */
function SectionHeader({
  name,
  slug,
}: {
  name: string;
  slug?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="site-section-kicker w-1.5 h-7 rounded-full shrink-0" aria-hidden="true" />
      <h2 className="site-section-title text-lg font-bold">{name}</h2>
      {slug && (
        <svg
          className="w-4 h-4 site-section-link shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="mb-5">
      {slug ? (
        <Link
          href={`/category/${slug}`}
          className="inline-flex group hover:opacity-80 transition-opacity"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

/** "المزيد" button — full-width dark on mobile, small bordered on desktop */
function SeeMoreButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        flex items-center justify-center gap-1.5
        w-full lg:w-auto
        px-5 py-3 lg:py-2
        rounded-lg border text-sm font-bold
        transition-colors duration-150
        bg-[color:var(--site-heading)] lg:bg-transparent
        text-white lg:text-[color:var(--site-text)]
        border-transparent lg:border-[color:var(--site-border)]
        lg:hover:border-[color:var(--site-accent)] lg:hover:text-[color:var(--site-accent)]
      "
    >
      {label}
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}

export default async function CategoryStrip({ block }: Props) {
  // Default limit = 4 (user can override per-category in Strapi)
  const limit = Math.max(2, Math.min(12, block.limit ?? 4));
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
    : await getArticles({
        categorySlug: block.category!.slug,
        pageSize: limit,
        includeChildCategories: true,
      });
  const articles = res.data ?? [];
  if (articles.length === 0) return null;

  /* ── Horizontal-scroll layout ─────────────────────────── */
  if (block.layout === "horizontal-scroll") {
    return (
      <section
        aria-label={headline}
        className="border-t border-[color:var(--site-border)] pt-6 pb-2"
      >
        <SectionHeader name={headline} slug={linkSlug} />
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
          {articles.map((a) => (
            <div key={a.slug || a.id} className="flex-shrink-0 w-44">
              <SmallCard article={a} />
            </div>
          ))}
        </div>
        {linkSlug && (
          <div className="mt-4">
            <SeeMoreButton href={`/category/${linkSlug}`} label={seeMoreLabel} />
          </div>
        )}
      </section>
    );
  }

  /* ── Three-up layout ──────────────────────────────────── */
  if (block.layout === "three-up") {
    return (
      <section
        aria-label={headline}
        className="border-t border-[color:var(--site-border)] pt-6 pb-2"
      >
        <SectionHeader name={headline} slug={linkSlug} />
        {/* gap-px creates subtle 1px separators between cells */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--site-border)] rounded-xl overflow-hidden mb-5">
          {articles.slice(0, 3).map((a) => (
            <div key={a.slug || a.id} className="bg-[color:var(--site-surface)] p-4">
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
        {linkSlug && <SeeMoreButton href={`/category/${linkSlug}`} label={seeMoreLabel} />}
      </section>
    );
  }

  /* ── Default: 4-up grid (hero-grid & everything else) ─── */
  return (
    <section
      aria-label={headline}
      className="border-t border-[color:var(--site-border)] pt-6 pb-2"
    >
      <SectionHeader name={headline} slug={linkSlug} />

      {/* 4-up grid — gap-px + bg-border creates thin 1px dividers between cells */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--site-border)] rounded-xl overflow-hidden mb-5">
        {articles.slice(0, limit).map((a) => (
          <div key={a.slug || a.id} className="bg-[color:var(--site-surface)] p-4">
            <ArticleCard article={a} />
          </div>
        ))}
      </div>

      {/* "المزيد" button */}
      {linkSlug && <SeeMoreButton href={`/category/${linkSlug}`} label={seeMoreLabel} />}
    </section>
  );
}
