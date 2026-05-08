import type {
  EmploymentType,
  JobLocationType,
  JobStatus,
  SalaryUnit,
} from "./types";

export type Locale = "en" | "ar";
export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "ar"] as const;

export interface Company {
  documentId: string;
  name: string;
  slug: string;
  logo: { url: string; width?: number; height?: number } | null;
}

export interface JobCategory {
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface PhysicalLocation {
  country: string;
  region?: string | null;
  city?: string | null;
}

export interface Job {
  id: number;
  documentId: string;
  locale: Locale;
  slug: string;
  externalId: string;

  title: string;
  description: string;
  descriptionShort: string | null;
  metaTitle: string | null;
  metaDescription: string | null;

  applyUrl: string;
  sourceUrl: string;
  referralTag: string | null;

  datePosted: string;
  validThrough: string;

  employmentType: EmploymentType;
  jobLocationType: JobLocationType;
  applicantLocationRequirements: string[];
  physicalLocation: PhysicalLocation | null;
  tags: string[];
  status: JobStatus;

  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string | null;
  salaryUnit: SalaryUnit | null;
  salaryUSDMin: number;
  salaryUSDMax: number;

  company: Company | null;
  jobCategory: JobCategory | null;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface FetchJobsOptions {
  locale?: Locale;
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  search?: string;
  remoteOnly?: boolean;
  sort?: "recent" | "salary-desc";
}

export interface FetchJobsResult {
  jobs: Job[];
  pagination: PaginationMeta;
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.islam-24.com"
).replace(/\/$/, "");

function getStrapiBaseUrl(): string {
  const u = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "").replace(/\/$/, "");
  if (!u) throw new Error("NEXT_PUBLIC_STRAPI_URL is not set");
  return u;
}

function buildQuery(
  entries: Array<[string, string | number | boolean | undefined | null]>,
): string {
  return entries
    .filter(
      ([, v]) =>
        v !== undefined && v !== null && v !== "" && !Number.isNaN(v as number),
    )
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
}

async function strapi<T>(
  path: string,
  init: RequestInit & { next?: { revalidate?: number } } = {},
): Promise<T | null> {
  const url = `${getStrapiBaseUrl()}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Strapi GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchJobs(
  opts: FetchJobsOptions = {},
): Promise<FetchJobsResult> {
  const {
    locale = DEFAULT_LOCALE,
    page = 1,
    pageSize = 24,
    categorySlug,
    search,
    remoteOnly,
    sort = "recent",
  } = opts;

  const sortField =
    sort === "salary-desc"
      ? "salaryUSDMax:desc,datePosted:desc"
      : "datePosted:desc";

  const entries: Array<[string, string | number | boolean | undefined]> = [
    ["locale", locale],
    ["filters[status][$eq]", "active"],
    ["populate[company][populate]", "*"],
    ["populate[jobCategory]", "*"],
    ["sort", sortField],
    ["pagination[page]", page],
    ["pagination[pageSize]", pageSize],
  ];

  if (categorySlug) {
    entries.push(["filters[jobCategory][slug][$eq]", categorySlug]);
  }
  if (remoteOnly) {
    entries.push(["filters[jobLocationType][$eq]", "TELECOMMUTE"]);
  }
  if (search) {
    entries.push(["filters[$or][0][title][$containsi]", search]);
    entries.push(["filters[$or][1][descriptionShort][$containsi]", search]);
  }

  const json = await strapi<{
    data: Job[];
    meta: { pagination: PaginationMeta };
  }>(`/api/jobs?${buildQuery(entries)}`, { next: { revalidate: 60 } });

  if (!json) {
    return {
      jobs: [],
      pagination: { page: 1, pageSize, pageCount: 0, total: 0 },
    };
  }

  return {
    jobs: json.data ?? [],
    pagination: json.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 0,
      total: 0,
    },
  };
}

export async function fetchJobBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Job | null> {
  const qs = buildQuery([
    ["locale", locale],
    ["filters[slug][$eq]", slug],
    ["filters[status][$eq]", "active"],
    ["populate[company][populate]", "*"],
    ["populate[jobCategory]", "*"],
    ["pagination[limit]", 1],
  ]);
  const json = await strapi<{ data: Job[] }>(`/api/jobs?${qs}`, {
    next: { revalidate: 300 },
  });
  if (!json?.data?.length) return null;
  return json.data[0];
}

export async function fetchJobCategories(
  locale: Locale = DEFAULT_LOCALE,
): Promise<JobCategory[]> {
  const qs = buildQuery([
    ["locale", locale],
    ["pagination[pageSize]", 100],
    ["sort", "name:asc"],
  ]);
  const json = await strapi<{ data: JobCategory[] }>(
    `/api/job-categories?${qs}`,
    { next: { revalidate: 3600 } },
  );
  return json?.data ?? [];
}

export function buildJobUrl(
  job: Pick<Job, "slug">,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const path = `/jobs/${job.slug}`;
  return locale === DEFAULT_LOCALE
    ? `${SITE_URL}${path}`
    : `${SITE_URL}${path}?lang=${locale}`;
}
