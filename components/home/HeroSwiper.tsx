/**
 * HeroSwiper — "موضوعات تهمك" top-stories block
 *
 * Layout:
 *  Desktop (lg+) RTL:
 *    [Side list — 4 articles left]  |  [Main article — right]
 *
 *  Mobile:
 *    [Main article on top]
 *    [Side article 1]
 *    [Side article 2]
 *    [Side article 3]
 *    [Side article 4]
 *
 * No carousel — all 5 visible at once. Static server component.
 */

import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl } from "@/lib/api";
import type { Article } from "@/types/strapi";

interface HeroSwiperProps {
  articles: Article[];
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

/** Large featured article — right column in RTL */
function MainCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";

  return (
    <Link
      href={`/article/${article.slug}`}
      className="content-card group rounded-xl overflow-hidden flex flex-col h-full"
    >
      {/* 16 : 9 image — no text overlay */}
      <div className="relative w-full aspect-video overflow-hidden">
        {hasImg ? (
          <Image
            src={img}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="hero-fallback w-full h-full" />
        )}
      </div>

      {/* Content area */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3">
          {article.category && (
            <span className="hero-category-pill text-xs font-bold px-3 py-1 rounded-full">
              {article.category.name}
            </span>
          )}
          <span className="site-muted text-xs flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(article.published_date || article.publishedAt)}
          </span>
        </div>

        {/* Title — accent colour signals "this is the main story" */}
        <h2 className="text-[color:var(--site-accent)] font-extrabold text-xl md:text-2xl line-clamp-3 leading-relaxed mb-2">
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="site-muted text-sm line-clamp-2 leading-relaxed mb-3">
            {article.excerpt}
          </p>
        )}

        {/* CTA */}
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-[color:var(--site-accent)]">
          اقرأ المزيد
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/** Compact side article — thumbnail left + text right */
function SideCard({ article }: { article: Article }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";

  return (
    <Link
      href={`/article/${article.slug}`}
      className="content-card group flex items-start gap-3 rounded-xl p-3 flex-1 hover:bg-[color:var(--site-surface-soft)] transition-colors"
    >
      {/* Thumbnail */}
      {hasImg ? (
        <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
          <Image
            src={img}
            alt={article.title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-20 h-16 rounded-lg shrink-0 content-thumb-fallback flex items-center justify-center text-xl">
          📖
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        {article.category && (
          <span className="hero-category-pill text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block w-fit">
            {article.category.name}
          </span>
        )}
        <h3 className="content-card-title text-sm font-bold line-clamp-2 leading-relaxed group-hover:text-[color:var(--site-accent)] transition-colors">
          {article.title}
        </h3>
        <span className="site-muted text-[10px] mt-1">
          {formatDate(article.published_date || article.publishedAt)}
        </span>
      </div>
    </Link>
  );
}

export default function HeroSwiper({ articles }: HeroSwiperProps) {
  const items = articles.slice(0, 5);

  if (items.length === 0) {
    return (
      <div className="hero-panel hero-fallback w-full h-48 flex items-center justify-center rounded-2xl">
        <p className="text-white/70 text-lg">لا توجد مقالات مميزة</p>
      </div>
    );
  }

  const [main, ...rest] = items;

  return (
    <section dir="rtl">
      {/* ── Section header ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="site-section-kicker w-1.5 h-7 rounded-full" />
        <h2 className="site-section-title text-lg font-bold">موضوعات تهمك</h2>
      </div>

      {/* ── Layout ──
          Mobile:  flex-col  → main on top, side articles below (vertical)
          Desktop: flex-row  → RTL: main RIGHT, side list LEFT            */}
      <div className="flex flex-col lg:flex-row gap-3">

        {/* Main article — right in RTL (rendered first = DOM first) */}
        <div className="lg:flex-[3]">
          <MainCard article={main} />
        </div>

        {/* Side list — left in RTL */}
        {rest.length > 0 && (
          <div className="lg:flex-[2] flex flex-col gap-2">
            {rest.slice(0, 4).map((article) => (
              <SideCard key={article.slug ?? article.id} article={article} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
