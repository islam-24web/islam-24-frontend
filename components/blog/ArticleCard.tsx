import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/strapi";
import { getStrapiMediaUrl } from "@/lib/api";

interface Props {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: Props) {
  const { title, slug, excerpt, featured_image, category, author_name, published_date, reading_time } = article;

  const imageUrl = featured_image?.url;
  const imageAlt = featured_image?.alternativeText || title;

  const formattedDate = new Date(published_date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (featured) {
    return (
      <article className="site-card group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 lg:grid lg:grid-cols-2 lg:gap-0">
        <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
          {imageUrl && (
            <Image
              src={getStrapiMediaUrl(imageUrl)}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
        </div>
        <div className="flex flex-col justify-center p-8 lg:p-12">
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="site-chip mb-3 inline-flex self-start rounded-full px-3 py-1 text-xs font-bold transition-colors"
            >
              {category.name}
            </Link>
          )}
          <h2 className="site-title text-2xl font-extrabold lg:text-3xl">
            <Link href={`/article/${slug}`} className="site-link transition-colors">
              {title}
            </Link>
          </h2>
          <p className="site-copy mt-4 line-clamp-3">{excerpt}</p>
          <div className="site-muted mt-6 flex items-center gap-4 text-sm">
            <span>{author_name}</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
            <time dateTime={published_date}>{formattedDate}</time>
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
            <span>{reading_time} دقائق قراءة</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="site-card group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        {imageUrl && (
          <Image
            src={getStrapiMediaUrl(imageUrl)}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="site-chip mb-2 inline-flex self-start rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors"
          >
            {category.name}
          </Link>
        )}
        <h3 className="site-title line-clamp-2 text-lg font-extrabold">
          <Link href={`/article/${slug}`} className="site-link transition-colors">
            {title}
          </Link>
        </h3>
        <p className="site-copy mt-2 flex-1 line-clamp-2 text-sm">{excerpt}</p>
        <div className="site-muted mt-4 flex items-center gap-3 text-xs">
          <time dateTime={published_date}>{formattedDate}</time>
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          <span>{reading_time} دقائق قراءة</span>
        </div>
      </div>
    </article>
  );
}
