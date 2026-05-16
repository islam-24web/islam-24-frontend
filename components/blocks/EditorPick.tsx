import Image from "next/image";
import Link from "next/link";
import { getArticles, getStrapiMediaUrl } from "@/lib/api";
import type { Article, EditorPickBlock } from "@/types/strapi";

interface Props {
  block: EditorPickBlock;
}

function PickCard({ article, prominent = false }: { article: Article; prominent?: boolean }) {
  const img = getStrapiMediaUrl(article.featured_image?.url);
  const hasImg = img && img !== "/placeholder.jpg";
  const height = prominent ? 320 : 200;
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group relative block rounded-xl overflow-hidden"
      style={{ height }}
    >
      {hasImg ? (
        <Image
          src={img}
          alt={article.title}
          fill
          sizes={prominent ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-emerald-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 left-0 p-4">
        {article.category && (
          <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block">
            {article.category.name}
          </span>
        )}
        <h3
          className={`text-white font-bold leading-relaxed line-clamp-2 group-hover:text-amber-300 transition-colors ${
            prominent ? "text-xl md:text-2xl" : "text-base"
          }`}
        >
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

export default async function EditorPick({ block }: Props) {
  const limit = Math.max(1, Math.min(12, block.limit ?? 4));

  let articles: Article[];
  if (block.mode === "flag-driven") {
    const res = await getArticles({
      showInEditorPick: true,
      sortByHomepagePriority: true,
      pageSize: limit,
    });
    articles = (res.data ?? []).filter(Boolean);
  } else {
    articles = (block.articles ?? []).filter(Boolean);
  }
  if (articles.length === 0) return null;

  return (
    <section aria-label={block.headline_ar || "اختيارات المحررين"}>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-amber-500 rounded-full" aria-hidden="true" />
          <h2 className="text-lg font-bold text-gray-800">
            {block.headline_ar || "اختيارات المحررين"}
          </h2>
        </div>
        {block.subhead && (
          <p className="text-sm text-gray-500 mt-1 mr-5 leading-relaxed">{block.subhead}</p>
        )}
      </div>

      {block.layout === "two-up" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {articles.slice(0, 2).map((a) => (
            <PickCard key={a.slug || a.id} article={a} prominent />
          ))}
        </div>
      )}

      {block.layout === "three-up" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {articles.slice(0, 3).map((a) => (
            <PickCard key={a.slug || a.id} article={a} />
          ))}
        </div>
      )}

      {block.layout === "magazine" && articles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <PickCard article={articles[0]} prominent />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {articles.slice(1, 5).map((a) => (
              <PickCard key={a.slug || a.id} article={a} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
