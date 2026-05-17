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
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
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
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                بحث
              </button>
            </form>
          </div>

          {query ? (
            <div className="mt-12">
              <p className="mb-8 text-center text-sm text-gray-600">
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
                <div className="mx-auto max-w-xl rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                  <h2 className="text-lg font-semibold text-gray-900">لا توجد نتائج</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    جرّب كلمة أقصر أو ابحث باسم تصنيف مثل القرآن، الحديث، الأذكار، أو الصحة النفسية.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900">ابدأ البحث</h2>
              <p className="mt-2 text-sm text-gray-600">
                اكتب كلمة أو موضوعاً للبحث في مقالات إسلام 24.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
