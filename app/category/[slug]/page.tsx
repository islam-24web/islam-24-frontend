import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getCategories, getArticles, getStrapiMediaUrl } from "@/lib/api";
import ArticleCard from "@/components/blog/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";

const SITE_URL = getSiteUrl();

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };

  const { name, seo, description } = category;
  const ogImage = seo?.og_image?.url;

  return {
    title: seo?.meta_title || `${name} Articles`,
    description: seo?.meta_description || description || `Browse all articles in ${name}`,
    alternates: { canonical: `${SITE_URL}/category/${params.slug}` },
    openGraph: {
      title: seo?.meta_title || `${name} Articles`,
      description: seo?.meta_description || description || `Browse all articles in ${name}`,
      url: `${SITE_URL}/category/${params.slug}`,
      images: ogImage ? [{ url: getStrapiMediaUrl(ogImage) }] : undefined,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const { name, description, parent, children } = category;
  const currentPage = Number(searchParams.page) || 1;

  const { data: articles, meta } = await getArticles({
    page: currentPage,
    pageSize: 12,
    categorySlug: params.slug,
  });

  const pagination = meta.pagination;
  const subcategories = children || [];

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
  ];
  if (parent) {
    breadcrumbs.push({ name: parent.name, url: `${SITE_URL}/category/${parent.slug}` });
  }
  breadcrumbs.push({ name, url: `${SITE_URL}/category/${params.slug}` });

  return (
    <>
      <JsonLd graph={[buildBreadcrumb(breadcrumbs)]} />

      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
            {parent && (
              <>
                <span>/</span>
                <Link href={`/category/${parent.slug}`} className="hover:text-gray-700 transition-colors">
                  {parent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium">{name}</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{name}</h1>
            {description && <p className="mt-4 text-lg text-gray-600 max-w-2xl">{description}</p>}
          </div>

          {subcategories.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {sub.name}
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
                  basePath={`/category/${params.slug}`}
                />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No articles in this category yet.</p>
              <Link href="/blog" className="mt-4 inline-flex text-sm text-blue-600 hover:underline">
                Browse all articles
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
