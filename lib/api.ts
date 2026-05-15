import type {
  StrapiResponse,
  Article,
  Category,
  Page,
  Navigation,
  Footer,
  Homepage,
} from "@/types/strapi";

// ─── Config ─────────────────────────────────────────────────────────

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

// ─── Empty Responses (used when Strapi is unreachable at build time) ─

const EMPTY_LIST_RESPONSE = <T,>(): StrapiResponse<T[]> => ({
  data: [] as T[],
  meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
});

// ─── Base Fetch ─────────────────────────────────────────────────────

interface FetchOptions {
  path: string;
  params?: Record<string, string>;
  revalidate?: number | false;
  tags?: string[];
}

async function strapiFetch<T>({ path, params, revalidate = 60, tags }: FetchOptions): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(url.toString(), {
    headers,
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
  });

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText} — ${url.pathname}`);
  }

  return res.json();
}

// ─── Safe Fetch Wrapper ─────────────────────────────────────────────
// Wraps strapiFetch with a fallback value for build-time failures.
// During build on Vercel, Strapi may be unreachable → return fallback
// instead of crashing. At runtime, ISR will retry and get real data.

async function safeFetch<T>(options: FetchOptions, fallback: T): Promise<T> {
  try {
    return await strapiFetch<T>(options);
  } catch (error) {
    console.warn(
      `[Strapi] Failed to fetch ${options.path} — using fallback. ` +
      `This is expected during build if Strapi is not reachable. ` +
      `Error: ${error instanceof Error ? error.message : error}`
    );
    return fallback;
  }
}

// ─── Helper: Build Strapi image URL ─────────────────────────────────

export function getStrapiMediaUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

// ─── Pages ──────────────────────────────────────────────────────────

export async function getPages(): Promise<Page[]> {
  const res = await safeFetch<StrapiResponse<Page[]>>(
    {
      path: "/pages",
      params: {
        "populate[content][on][blocks.hero][populate]": "*",
        "populate[content][on][blocks.text-block][populate]": "*",
        "populate[content][on][blocks.image-block][populate]": "*",
        "populate[content][on][blocks.cta-block][populate]": "*",
        "populate[content][on][blocks.services-block][populate][items]": "true",
        "populate[seo][populate]": "*",
      },
      tags: ["pages"],
    },
    EMPTY_LIST_RESPONSE<Page>()
  );
  return res.data;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const res = await safeFetch<StrapiResponse<Page[]>>(
    {
      path: "/pages",
      params: {
        "filters[slug][$eq]": slug,
        "populate[content][on][blocks.hero][populate]": "*",
        "populate[content][on][blocks.text-block][populate]": "*",
        "populate[content][on][blocks.image-block][populate]": "*",
        "populate[content][on][blocks.cta-block][populate]": "*",
        "populate[content][on][blocks.services-block][populate][items]": "true",
        "populate[seo][populate]": "*",
      },
      tags: ["pages"],
      revalidate: 60,
    },
    EMPTY_LIST_RESPONSE<Page>()
  );

  return res.data?.[0] ?? null;
}

// ─── Articles ───────────────────────────────────────────────────────

export async function getArticles(options?: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  featured?: boolean;
}): Promise<StrapiResponse<Article[]>> {
  const params: Record<string, string> = {
    "sort[0]": "published_date:desc",
    "pagination[page]": String(options?.page ?? 1),
    "pagination[pageSize]": String(options?.pageSize ?? 12),
    "populate[featured_image]": "*",
    "populate[author_image]": "*",
    "populate[category]": "*",
    "populate[seo][populate]": "*",
  };

  if (options?.categorySlug) {
    params["filters[category][slug][$eq]"] = options.categorySlug;
  }

  if (options?.featured !== undefined) {
    params["filters[is_featured][$eq]"] = String(options.featured);
  }

  return safeFetch<StrapiResponse<Article[]>>(
    { path: "/articles", params, tags: ["articles"] },
    EMPTY_LIST_RESPONSE<Article>()
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await safeFetch<StrapiResponse<Article[]>>(
    {
      path: "/articles",
      params: {
        "filters[slug][$eq]": slug,
        "populate[featured_image]": "*",
        "populate[author_image]": "*",
        "populate[category][populate][parent]": "*",
        "populate[seo][populate]": "*",
        "populate[faqs]": "*",
        "populate[sources]": "*",
      },
      tags: ["articles"],
      revalidate: 60,
    },
    EMPTY_LIST_RESPONSE<Article>()
  );

  return res.data?.[0] ?? null;
}

export async function getRelatedArticles(
  categorySlug: string,
  excludeSlug: string,
  limit = 3
): Promise<Article[]> {
  const res = await safeFetch<StrapiResponse<Article[]>>(
    {
      path: "/articles",
      params: {
        "filters[category][slug][$eq]": categorySlug,
        "filters[slug][$ne]": excludeSlug,
        "pagination[pageSize]": String(limit),
        "sort[0]": "published_date:desc",
        "populate[featured_image]": "*",
        "populate[category]": "*",
      },
      tags: ["articles"],
    },
    EMPTY_LIST_RESPONSE<Article>()
  );

  return res.data;
}

// ─── Categories ─────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await safeFetch<StrapiResponse<Category[]>>(
    {
      path: "/categories",
      params: {
        "populate[parent]": "*",
        "populate[children]": "*",
        "populate[seo][populate]": "*",
      },
      tags: ["categories"],
      revalidate: 300,
    },
    EMPTY_LIST_RESPONSE<Category>()
  );
  return res.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await safeFetch<StrapiResponse<Category[]>>(
    {
      path: "/categories",
      params: {
        "filters[slug][$eq]": slug,
        "populate[parent]": "*",
        "populate[children]": "*",
        "populate[articles][populate][featured_image]": "*",
        "populate[articles][populate][category]": "*",
        "populate[seo][populate]": "*",
      },
      tags: ["categories"],
    },
    EMPTY_LIST_RESPONSE<Category>()
  );

  return res.data?.[0] ?? null;
}

// ─── Navigation & Footer ────────────────────────────────────────────

export async function getNavigation(): Promise<Navigation | null> {
  try {
    const res = await strapiFetch<StrapiResponse<Navigation>>({
      path: "/navigation",
      params: {
        "populate[logo]": "*",
        "populate[links]": "*",
        "populate[nav_items][populate][sub_items]": "*",
      },
      tags: ["navigation"],
      revalidate: 300,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getHomepage(): Promise<Homepage | null> {
  try {
    const res = await strapiFetch<StrapiResponse<Homepage>>({
      path: "/homepage",
      params: {
        "populate[sections][on][blocks.daily-tiles][populate][items]": "true",
        "populate[sections][on][blocks.category-strip][populate][category]": "true",
        "populate[seo][populate]": "*",
      },
      tags: ["homepage"],
      revalidate: 300,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getFooter(): Promise<Footer | null> {
  try {
    const res = await strapiFetch<StrapiResponse<Footer>>({
      path: "/footer",
      params: {
        "populate[links]": "*",
        "populate[social_links]": "*",
      },
      tags: ["footer"],
      revalidate: 300,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

// ─── Sitemap Helpers ────────────────────────────────────────────────

export async function getAllSlugs(): Promise<{
  pages: string[];
  articles: string[];
  categories: string[];
}> {
  try {
    const [pagesRes, articlesRes, categoriesRes] = await Promise.all([
      strapiFetch<StrapiResponse<{ slug: string }[]>>({
        path: "/pages",
        params: { "fields[0]": "slug" },
        revalidate: 3600,
      }),
      strapiFetch<StrapiResponse<{ slug: string }[]>>({
        path: "/articles",
        params: { "fields[0]": "slug", "pagination[pageSize]": "1000" },
        revalidate: 3600,
      }),
      strapiFetch<StrapiResponse<{ slug: string }[]>>({
        path: "/categories",
        params: { "fields[0]": "slug" },
        revalidate: 3600,
      }),
    ]);

    return {
      pages: pagesRes.data.map((p) => p.slug),
      articles: articlesRes.data.map((a) => a.slug),
      categories: categoriesRes.data.map((c) => c.slug),
    };
  } catch (error) {
    console.warn(
      `[Strapi] Failed to fetch slugs for sitemap — returning empty. ` +
      `Error: ${error instanceof Error ? error.message : error}`
    );
    return { pages: [], articles: [], categories: [] };
  }
}
