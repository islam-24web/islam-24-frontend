import Image from "next/image";
import Link from "next/link";
import HeroSwiper from "@/components/home/HeroSwiper";
import { getArticles, getStrapiMediaUrl } from "@/lib/api";
import type { Article, HomeHeroBlock } from "@/types/strapi";

interface Props {
  block: HomeHeroBlock;
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

function HeroSingle({ article, eyebrow }: { article: Article; eyebrow?: string | null }) {
  const imgUrl = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = imgUrl && imgUrl !== "/placeholder.jpg";
  return (
    <Link
      href={`/article/${article.slug}`}
      className="hero-panel relative block w-full overflow-hidden rounded-2xl group"
      style={{ height: 400 }}
      dir="rtl"
    >
      {hasImg ? (
        <Image
          src={imgUrl}
          alt={article.title}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="hero-fallback w-full h-full" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" aria-hidden="true" />

      <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10">
        {(eyebrow || article.category) && (
          <div className="flex items-center gap-3 mb-3">
            {eyebrow && (
              <span className="text-[color:var(--site-gold)] text-xs font-semibold tracking-wide uppercase">
                {eyebrow}
              </span>
            )}
            {article.category && (
              <span className="hero-category-pill text-xs font-bold px-3 py-1.5 rounded-full">
                {article.category.name}
              </span>
            )}
            <span className="text-gray-300 text-xs">
              {formatDate(article.published_date || article.publishedAt)}
            </span>
          </div>
        )}
        <h2 className="text-white font-bold text-xl md:text-3xl line-clamp-2 leading-relaxed mb-3 group-hover:text-[color:var(--site-gold)] transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-4 max-w-2xl leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <span className="hero-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          اقرأ المزيد
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default async function HomeHero({ block }: Props) {
  const limit = Math.max(1, Math.min(8, block.limit ?? 5));

  let articles: Article[] = [];
  if (block.mode === "hand-picked") {
    articles = (block.articles ?? []).slice(0, limit);
  } else if (block.mode === "flag-driven") {
    const res = await getArticles({
      showInHero: true,
      sortByHomepagePriority: true,
      pageSize: limit,
    });
    articles = res.data ?? [];
    if (articles.length < Math.min(3, limit)) {
      const fallback = await getArticles({ featured: true, pageSize: limit });
      articles = (fallback.data ?? []).slice(0, limit);
    }
  } else {
    const res = await getArticles({ featured: true, pageSize: limit });
    articles = res.data ?? [];
    if (articles.length < Math.min(3, limit)) {
      const fallback = await getArticles({ pageSize: limit });
      articles = (fallback.data ?? []).slice(0, limit);
    }
  }

  if (articles.length === 0) return null;

  if (block.variant === "single") {
    return <HeroSingle article={articles[0]} eyebrow={block.eyebrow} />;
  }

  return <HeroSwiper articles={articles} />;
}
