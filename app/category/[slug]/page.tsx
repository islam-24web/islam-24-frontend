import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getCategories, getArticles, getStrapiMediaUrl } from "@/lib/api";
import ArticleCard from "@/components/blog/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";
import { buildItemList } from "@/lib/seo/schema/item-list";

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
  const subcategories = children || [];

  const { data: articles, meta } = await getArticles({
    page: currentPage,
    pageSize: 12,
    categorySlug: params.slug,
    includeChildCategories: subcategories.length > 0,
  });

  const pagination = meta.pagination;

  const breadcrumbs = [
    { name: "الرئيسية", url: SITE_URL },
    { name: "المقالات", url: `${SITE_URL}/blog` },
  ];
  if (parent) {
    breadcrumbs.push({ name: parent.name, url: `${SITE_URL}/category/${parent.slug}` });
  }
  breadcrumbs.push({ name, url: `${SITE_URL}/category/${params.slug}` });
  const itemList = buildItemList(
    articles.map((article) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      name: article.title,
    })),
    ((pagination?.page ?? currentPage) - 1) * (pagination?.pageSize ?? 12) + 1,
  );

  return (
    <>
      <JsonLd graph={[buildBreadcrumb(breadcrumbs), ...(articles.length > 0 ? [itemList] : [])]} />

      <div className="site-page py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="site-muted mb-8 flex items-center gap-2 text-sm">
            <Link href="/" className="transition-opacity hover:opacity-80">الرئيسية</Link>
            <span>/</span>
            <Link href="/blog" className="transition-opacity hover:opacity-80">المقالات</Link>
            {parent && (
              <>
                <span>/</span>
                <Link href={`/category/${parent.slug}`} className="transition-opacity hover:opacity-80">
                  {parent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="site-title font-bold">{name}</span>
          </nav>

          <div className="mb-12">
            <h1 className="site-title text-4xl font-extrabold sm:text-5xl">{name}</h1>
            {description && <p className="site-muted mt-4 max-w-2xl text-lg leading-[2]">{description}</p>}
          </div>

          {subcategories.length > 0 && (
            <div className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className="content-card group rounded-xl p-6 transition-all hover:shadow-md"
                  >
                    <h3 className="content-card-title text-base font-bold transition-colors">{sub.name}</h3>
                    {sub.description && (
                      <p className="site-muted text-xs mt-2 leading-relaxed line-clamp-2">{sub.description}</p>
                    )}
                    <span className="inline-block mt-3 text-xs font-bold text-[color:var(--site-accent)]">تصفح ←</span>
                  </Link>
                ))}
              </div>
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
              <p className="site-muted text-lg">لا توجد مقالات في هذا التصنيف بعد.</p>
              <Link href="/blog" className="site-link mt-4 inline-flex text-sm font-semibold hover:underline">
                تصفح كل المقالات
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
