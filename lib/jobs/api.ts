import type {
  EmploymentType,
  JobLocationType,
  JobStatus,
  SalaryUnit,
} from "./types";
import { unstable_cache } from "next/cache";

export type Locale = "en" | "ar";
export const DEFAULT_LOCALE: Locale = "ar";
export const SUPPORTED_LOCALES: readonly Locale[] = ["ar", "en"] as const;

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
  titleArabic: string | null;
  originalTitle: string | null;
  description: string;
  descriptionShort: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;

  applyUrl: string;
  applicationUrl: string | null;
  sourceUrl: string;
  referralTag: string | null;
  isReferral: boolean;
  sourceReviewedAt: string | null;
  expiresAt: string | null;

  datePosted: string;
  validThrough: string;

  employmentType: EmploymentType;
  jobLocationType: JobLocationType;
  applicantLocationRequirements: string[];
  physicalLocation: PhysicalLocation | null;
  tags: string[];
  status: JobStatus;
  isPublished: boolean;

  remoteType: string | null;
  contractType: string | null;
  payText: string | null;
  category: string | null;
  summary: string | null;
  responsibilities: string | null;
  requirements: string | null;
  contractDetails: string | null;
  locationEligibility: string | null;

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

const VERIFIED_REMOTE_URL = (
  process.env.NEXT_PUBLIC_VERIFIED_REMOTE_URL ??
  "https://verifiedremote.islam-24.com"
).replace(/\/$/, "");
const JOB_DETAIL_REVALIDATE = 3600;
const PUBLIC_STATUS: JobStatus = "published";

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
  init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {},
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
    ["filters[status][$eq]", PUBLIC_STATUS],
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
    entries.push(["filters[$and][1][$or][0][title][$containsi]", search]);
    entries.push(["filters[$and][1][$or][1][summary][$containsi]", search]);
    entries.push(["filters[$and][1][$or][2][descriptionShort][$containsi]", search]);
  }

  const json = await strapi<{
    data: Job[];
    meta: { pagination: PaginationMeta };
  }>(`/api/jobs?${buildQuery(entries)}`, {
    next: { revalidate: 60, tags: ["jobs"] },
  });

  if (!json) {
    return {
      jobs: [],
      pagination: { page: 1, pageSize, pageCount: 0, total: 0 },
    };
  }

  return {
    jobs: (json.data ?? []).filter(isPublicVerifiedJob),
    pagination: json.meta?.pagination ?? {
      page: 1,
      pageSize,
      pageCount: 0,
      total: 0,
    },
  };
}

const fetchJobBySlugCached = unstable_cache(
  async (slug: string, locale: Locale = DEFAULT_LOCALE): Promise<Job | null> => {
    const qs = buildQuery([
      ["locale", locale],
      ["filters[slug][$eq]", slug],
      ["filters[status][$eq]", PUBLIC_STATUS],
      ["populate[company][populate]", "*"],
      ["populate[jobCategory]", "*"],
      ["pagination[limit]", 1],
    ]);
    const json = await strapi<{ data: Job[] }>(`/api/jobs?${qs}`, {
      next: { revalidate: JOB_DETAIL_REVALIDATE, tags: ["jobs"] },
    });
    if (!json?.data?.length) return null;
    return json.data[0];
  },
  ["job-by-slug"],
  { revalidate: JOB_DETAIL_REVALIDATE, tags: ["jobs"] },
);

export async function fetchJobBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Job | null> {
  return fetchJobBySlugCached(slug, locale);
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
    { next: { revalidate: 3600, tags: ["job-categories"] } },
  );
  return json?.data ?? [];
}

export async function getAllJobSlugs(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  const qs = buildQuery([
    ["locale", "en"],
    ["fields[0]", "slug"],
    ["fields[1]", "updatedAt"],
    ["filters[status][$eq]", PUBLIC_STATUS],
    ["pagination[pageSize]", 1000],
  ]);
  try {
    const json = await strapi<{
      data: Array<{ slug: string; updatedAt: string }>;
    }>(`/api/jobs?${qs}`, { next: { revalidate: 3600, tags: ["jobs"] } });
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export function buildJobUrl(
  job: Pick<Job, "slug">,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const path = locale === "en" ? `/en/jobs/${job.slug}` : `/jobs/${job.slug}`;
  return `${VERIFIED_REMOTE_URL}${path}`;
}

export function buildVerifiedRemoteUrl(locale: Locale = DEFAULT_LOCALE): string {
  return locale === "en" ? `${VERIFIED_REMOTE_URL}/en` : VERIFIED_REMOTE_URL;
}

export function buildLocalJobHref(
  job: Pick<Job, "slug">,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return locale === "en" ? `/en/jobs/${job.slug}` : `/jobs/${job.slug}`;
}

export function getJobApplicationUrl(job: Pick<Job, "applicationUrl" | "applyUrl">): string {
  return job.applicationUrl || job.applyUrl;
}

export function isPublicVerifiedJob(job: Job): boolean {
  return Boolean(
    job.status === PUBLIC_STATUS &&
      job.isPublished &&
      job.title?.trim() &&
      job.company?.name?.trim() &&
      job.sourceUrl?.trim() &&
      getJobApplicationUrl(job)?.trim() &&
      job.sourceReviewedAt,
  );
}
