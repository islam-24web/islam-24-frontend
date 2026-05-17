import type { Metadata } from "next";
import { searchArticles } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildItemList } from "@/lib/seo/schema/item-list";
import ArticleCard from "@/components/blog/ArticleCard";
import Pagination from "@/components/ui/Pagination";

const SITE_URL = getSiteUrl();

interface Props {
  searchParams: {
    q?: string;
    page?: string;
  };
}

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 120);
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const query = normalizeQuery(searchParams.q);
  const title = query ? `Search results for "${query}"` : "Search";
  return {
    title,
    description: query
      ? `Search results for ${query} on Islam 24.`
      : "Search Islam 24 articles and educational resources.",
    alternates: {
      canonical: query
        ? `${SITE_URL}/search?q=${encodeURIComponent(query)}`
        : `${SITE_URL}/search`,
    },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = normalizeQuery(searchParams.q);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;
  const response = query
    ? await searchArticles({ query, page, pageSize })
    : null;

  const articles = response?.data ?? [];
  const pagination = response?.meta.pagination;
  const extraParams = new URLSearchParams();
  if (query) extraParams.set("q", query);

  const itemList = buildItemList(
    articles.map((article) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      name: article.title,
    })),
    ((pagination?.page ?? page) - 1) * (pagination?.pageSize ?? pageSize) + 1,
  );

  return (
    <>
      {query && articles.length > 0 && <JsonLd graph={[itemList]} />}
      <section className="site-page py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="site-title text-3xl font-extrabold sm:text-4xl">
              البحث في إسلام 24
            </h1>
            <form action="/search" method="get" role="search" className="mt-8 flex gap-2">
              <label htmlFor="search-page-query" className="sr-only">
                اكتب كلمة البحث
              </label>
              <input
                id="search-page-query"
                name="q"
                type="search"
                dir="rtl"
                defaultValue={query}
                placeholder="ابحث عن مقال، دعاء، حكم، أو موضوع"
                className="site-input min-w-0 flex-1 rounded-lg border px-4 py-3 text-sm outline-none transition"
              />
              <button
                type="submit"
                className="site-primary-button inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition"
              >
                بحث
              </button>
            </form>
          </div>

          {query ? (
            <div className="mt-12">
              <p className="site-muted mb-8 text-center text-sm">
                {pagination?.total
                  ? `${pagination.total} نتيجة بحث عن "${query}"`
                  : `لا توجد نتائج مطابقة لـ "${query}"`}
              </p>

              {articles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                  {pagination && (
                    <Pagination
                      currentPage={pagination.page}
                      pageCount={pagination.pageCount}
                      basePath="/search"
                      extraParams={extraParams}
                    />
                  )}
                </>
              ) : (
                <div className="site-empty mx-auto max-w-xl rounded-lg border border-dashed p-8 text-center">
                  <h2 className="site-title text-lg font-bold">لا توجد نتائج</h2>
                  <p className="site-muted mt-2 text-sm leading-[2]">
                    جرّب كلمة أقصر أو ابحث باسم تصنيف مثل القرآن، الحديث، الأذكار، أو الصحة النفسية.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="site-empty mx-auto mt-12 max-w-xl rounded-lg border p-8 text-center">
              <h2 className="site-title text-lg font-bold">ابدأ البحث</h2>
              <p className="site-muted mt-2 text-sm leading-[2]">
                اكتب كلمة أو موضوعاً للبحث في مقالات إسلام 24.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
