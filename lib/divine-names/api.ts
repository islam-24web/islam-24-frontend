/**
 * Divine Names — entity client. Kept separate from `lib/api.ts` (editorial)
 * and `lib/jobs/api.ts` (jobs vertical), per the chassis convention of
 * one client per data domain.
 */

import type { StrapiResponse, DivineName, DivineNameRef } from "@/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

const EMPTY_LIST = <T,>(): StrapiResponse<T[]> => ({
  data: [] as T[],
  meta: { pagination: { page: 1, pageSize: 100, pageCount: 0, total: 0 } },
});

interface FetchOptions {
  path: string;
  params?: Record<string, string>;
  revalidate?: number;
  tags?: string[];
}

async function strapiFetch<T>({ path, params, revalidate = 300, tags }: FetchOptions): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate, tags },
  });
  if (!res.ok) {
    throw new Error(`Strapi error: ${res.status} ${res.statusText} — ${url.pathname}`);
  }
  return res.json();
}

async function safeFetch<T>(opts: FetchOptions, fallback: T): Promise<T> {
  try {
    return await strapiFetch<T>(opts);
  } catch (err) {
    console.warn(
      `[divine-names] fetch failed ${opts.path} — using fallback. ${err instanceof Error ? err.message : err}`,
    );
    return fallback;
  }
}

const PAIR_FIELDS = ["id", "documentId", "number", "arabic", "transliteration", "slug"] as const;
const PAIR_POPULATE = (key: string): Record<string, string> => {
  const out: Record<string, string> = {};
  PAIR_FIELDS.forEach((f, i) => {
    out[`populate[${key}][fields][${i}]`] = f;
  });
  return out;
};

export async function getAllDivineNames(): Promise<DivineNameRef[]> {
  const res = await safeFetch<StrapiResponse<DivineNameRef[]>>(
    {
      path: "/divine-names",
      params: {
        "fields[0]": "id",
        "fields[1]": "documentId",
        "fields[2]": "number",
        "fields[3]": "arabic",
        "fields[4]": "transliteration",
        "fields[5]": "slug",
        "sort[0]": "number:asc",
        "pagination[pageSize]": "100",
      },
      tags: ["divine-names"],
      revalidate: 3600,
    },
    EMPTY_LIST<DivineNameRef>(),
  );
  return res.data;
}

export async function getDivineNameBySlug(slug: string): Promise<DivineName | null> {
  const res = await safeFetch<StrapiResponse<DivineName[]>>(
    {
      path: "/divine-names",
      params: {
        "filters[slug][$eq]": slug,
        "populate[featuredImage]": "*",
        "populate[audio]": "*",
        "populate[faqs]": "*",
        "populate[sources]": "*",
        "populate[seo][populate]": "*",
        ...PAIR_POPULATE("mercyPair"),
        ...PAIR_POPULATE("oppositePair"),
        ...PAIR_POPULATE("quranicPair"),
      },
      tags: ["divine-names"],
      revalidate: 300,
    },
    EMPTY_LIST<DivineName>(),
  );
  return res.data?.[0] ?? null;
}

export async function getAllDivineNameSlugs(): Promise<string[]> {
  try {
    const res = await strapiFetch<StrapiResponse<{ slug: string }[]>>({
      path: "/divine-names",
      params: {
        "fields[0]": "slug",
        "pagination[pageSize]": "100",
      },
      revalidate: 3600,
    });
    return res.data.map((d) => d.slug);
  } catch {
    return [];
  }
}
