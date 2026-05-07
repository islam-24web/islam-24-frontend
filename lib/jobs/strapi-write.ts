/**
 * Strapi write helpers for the jobs sync pipeline.
 * Read-only / cached helpers belong in lib/api.ts — this module is for upserts
 * triggered by the sync runner and uses no Next.js caching.
 */

import type {
  ArabicTranslation,
  EmploymentType,
  JobLocationType,
  JobStatus,
  SalaryUnit,
} from "./types";

const STRAPI_URL = (
  process.env.STRAPI_URL || "http://localhost:1337"
).replace(/\/$/, "");

function token(): string {
  const t = process.env.STRAPI_API_TOKEN;
  if (!t) throw new Error("STRAPI_API_TOKEN missing");
  return t;
}

async function strapi<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${STRAPI_URL}/api/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const detail = JSON.stringify(
      (json as { error?: unknown })?.error ?? json
    ).slice(0, 400);
    throw new Error(`Strapi ${method} ${path} → ${res.status}: ${detail}`);
  }
  return json as T;
}

// ─────────────── slug helper ───────────────

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// ─────────────── lookup caches ───────────────

interface ListResponse<T> {
  data: T[];
  meta?: { pagination?: { total?: number } };
}

interface SourceRow {
  documentId: string;
  name: string;
  slug: string;
}
interface CategoryRow {
  documentId: string;
  slug: string;
}
interface CompanyRow {
  documentId: string;
  slug: string;
  name: string;
}

export async function loadSourcesByName(): Promise<Map<string, string>> {
  const json = await strapi<ListResponse<SourceRow>>(
    "GET",
    "sources?pagination[limit]=100"
  );
  const map = new Map<string, string>();
  for (const s of json.data) map.set(s.name, s.documentId);
  return map;
}

export async function loadCategoriesBySlug(): Promise<Map<string, string>> {
  const json = await strapi<ListResponse<CategoryRow>>(
    "GET",
    "job-categories?locale=en&pagination[limit]=100"
  );
  const map = new Map<string, string>();
  for (const c of json.data) map.set(c.slug, c.documentId);
  return map;
}

export async function loadCompaniesBySlug(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  while (true) {
    const json = await strapi<ListResponse<CompanyRow> & {
      meta: { pagination: { page: number; pageCount: number } };
    }>("GET", `companies?pagination[page]=${page}&pagination[pageSize]=100`);
    for (const c of json.data) map.set(c.slug, c.documentId);
    if (page >= (json.meta?.pagination?.pageCount ?? 1)) break;
    page++;
  }
  return map;
}

// ─────────────── company upsert ───────────────

export async function findOrCreateCompany(
  name: string,
  cache: Map<string, string>,
  extras?: { logo?: string; website?: string; country?: string }
): Promise<string> {
  const slug = kebab(name) || "company";
  const cached = cache.get(slug);
  if (cached) return cached;

  // Defensive lookup in case the cache missed (e.g. created by a parallel run)
  const existing = await strapi<ListResponse<CompanyRow>>(
    "GET",
    `companies?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1`
  );
  if (existing.data?.[0]) {
    cache.set(slug, existing.data[0].documentId);
    return existing.data[0].documentId;
  }

  const created = await strapi<{ data: { documentId: string } }>(
    "POST",
    "companies",
    {
      data: {
        name,
        slug,
        website: extras?.website,
        country: extras?.country,
        locale: "en",
        publishedAt: new Date().toISOString(),
      },
    }
  );
  const documentId = created.data.documentId;
  cache.set(slug, documentId);
  return documentId;
}

// ─────────────── job upsert ───────────────

export interface JobUpsertInput {
  // locale-neutral fields
  externalId: string;
  sourceUrl: string;
  applyUrl: string;
  datePosted: string;
  validThrough: string;
  employmentType: EmploymentType;
  jobLocationType: JobLocationType;
  applicantLocationRequirements?: string[];
  tags: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryUnit?: SalaryUnit;
  salaryUSDMin?: number;
  salaryUSDMax?: number;
  status: JobStatus;
  halalScore: number;
  halalNotes: string;
  // EN locale fields
  title: string;
  description: string;
  descriptionShort: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  // relations (documentIds)
  companyId: string;
  jobCategoryId?: string;
  sourceId: string;
}

export interface JobUpsertResult {
  documentId: string;
  created: boolean;
}

export async function upsertJobEN(input: JobUpsertInput): Promise<JobUpsertResult> {
  // Find by externalId — it's unique across documents
  const found = await strapi<ListResponse<{ documentId: string }>>(
    "GET",
    `jobs?filters[externalId][$eq]=${encodeURIComponent(
      input.externalId
    )}&pagination[limit]=1&publicationState=preview`
  );
  const existingId = found.data?.[0]?.documentId;

  const payload = {
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      descriptionShort: input.descriptionShort,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      externalId: input.externalId,
      sourceUrl: input.sourceUrl,
      applyUrl: input.applyUrl,
      datePosted: input.datePosted,
      validThrough: input.validThrough,
      employmentType: input.employmentType,
      jobLocationType: input.jobLocationType,
      applicantLocationRequirements: input.applicantLocationRequirements,
      tags: input.tags,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      salaryCurrency: input.salaryCurrency,
      salaryUnit: input.salaryUnit,
      salaryUSDMin: input.salaryUSDMin,
      salaryUSDMax: input.salaryUSDMax,
      status: input.status,
      halalScore: input.halalScore,
      halalNotes: input.halalNotes,
      company: input.companyId,
      jobCategory: input.jobCategoryId,
      source: input.sourceId,
      locale: "en",
      publishedAt: new Date().toISOString(),
    },
  };

  if (existingId) {
    await strapi("PUT", `jobs/${existingId}?locale=en`, payload);
    return { documentId: existingId, created: false };
  }
  const created = await strapi<{ data: { documentId: string } }>(
    "POST",
    "jobs",
    payload
  );
  return { documentId: created.data.documentId, created: true };
}

export interface JobARLocaleInput {
  documentId: string;
  translation: ArabicTranslation;
  // company/category/source already linked via EN entry — only locale-specific fields
}

export async function upsertJobAR(input: JobARLocaleInput): Promise<void> {
  await strapi("PUT", `jobs/${input.documentId}?locale=ar`, {
    data: {
      title: input.translation.titleAr,
      slug: input.translation.slugAr,
      description: input.translation.descriptionAr,
      descriptionShort: input.translation.descriptionShortAr,
      metaTitle: input.translation.metaTitleAr,
      metaDescription: input.translation.metaDescriptionAr,
      publishedAt: new Date().toISOString(),
    },
  });
}

// ─────────────── sync-log helpers ───────────────

export async function createSyncLog(sourceName: string): Promise<string> {
  const created = await strapi<{ data: { documentId: string } }>(
    "POST",
    "sync-logs",
    {
      data: {
        sourceName,
        startedAt: new Date().toISOString(),
        status: "running",
      },
    }
  );
  return created.data.documentId;
}

export interface SyncLogUpdate {
  finishedAt: string;
  durationMs: number;
  jobsFound: number;
  jobsAdded: number;
  jobsUpdated: number;
  jobsRejected: number;
  errors?: string[];
  status: "success" | "partial" | "failed";
}

export async function updateSyncLog(
  documentId: string,
  patch: SyncLogUpdate
): Promise<void> {
  await strapi("PUT", `sync-logs/${documentId}`, {
    data: {
      finishedAt: patch.finishedAt,
      durationMs: patch.durationMs,
      jobsFound: patch.jobsFound,
      jobsAdded: patch.jobsAdded,
      jobsUpdated: patch.jobsUpdated,
      jobsRejected: patch.jobsRejected,
      errors: patch.errors,
      status: patch.status,
    },
  });
}

export async function touchSourceLastSynced(sourceId: string): Promise<void> {
  await strapi("PUT", `sources/${sourceId}`, {
    data: { lastSyncedAt: new Date().toISOString() },
  });
}

export { kebab as kebabCase };
