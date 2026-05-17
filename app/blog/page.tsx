import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, getCategories } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildItemList } from "@/lib/seo/schema/item-list";
import ArticleCard from "@/components/blog/ArticleCard";
import Pagination from "@/components/ui/Pagination";

const SITE_URL = getSiteUrl();

interface Props {
  searchParams: { page?: string; category?: string };
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const category = searchParams.category;
  // `?page=1` is canonical-equivalent to no page param (and is 301'd to /blog
  // in next.config.js redirects). Page >1 keeps its own canonical so paginated
  // listings stay indexable and don't collapse into /blog.
  const page = Number(searchParams.page);
  const canonical = category
    ? page > 1
      ? `${SITE_URL}/blog?category=${category}&page=${page}`
      : `${SITE_URL}/blog?category=${category}`
    : page > 1
      ? `${SITE_URL}/blog?page=${page}`
      : `${SITE_URL}/blog`;
  return {
    title: "Blog",
    description: "Read our latest articles, tutorials, and insights.",
    alternates: { canonical },
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const currentPage = Number(searchParams.page) || 1;
  const categorySlug = searchParams.category;

  const [{ data: articles, meta }, categories] = await Promise.all([
    getArticles({ page: currentPage, pageSize: 12, categorySlug }),
    getCategories(),
  ]);

  const pagination = meta.pagination;
  const parentCategories = categories.filter((c) => !c.parent);
  const itemList = buildItemList(
    articles.map((article) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      name: article.title,
    })),
    ((pagination?.page ?? currentPage) - 1) * (pagination?.pageSize ?? 12) + 1,
  );

  return (
    <>
      {articles.length > 0 && <JsonLd graph={[itemList]} />}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-gray-600">Discover our latest articles and insights</p>
        </div>

        {parentCategories.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/blog"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !categorySlug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </Link>
            {parentCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  categorySlug === cat.slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

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
                basePath={categorySlug ? `/blog?category=${categorySlug}` : "/blog"}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles found.</p>
            {categorySlug && (
              <Link href="/blog" className="mt-4 inline-flex text-sm text-blue-600 hover:underline">
                Clear filter
              </Link>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
