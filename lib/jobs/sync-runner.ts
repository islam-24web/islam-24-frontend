/**
 * RemoteOK sync orchestrator.
 *
 * Flow per job:
 *   1. Map RemoteOK row → JobDraft.
 *   2. Halal filter.
 *   3. Find/create company.
 *   4. Classify category by tags + title.
 *   5. If approved + budget remaining: translate to Arabic via Gemini.
 *   6. Upsert EN locale.
 *   7. If translated: upsert AR localization.
 *
 * Budget: when MAX_TRANSLATIONS_PER_SYNC is hit, remaining approved jobs
 * are saved EN-only (status stays "active") so the next sync can fill in
 * the AR side. Rejected jobs never consume Gemini budget.
 */

import { checkHalal } from "./halal-filter";
import { classifyByTags } from "./category-classifier";
import { translateToArabic } from "./gemini";
import { fetchRemoteOK, mapRemoteOK } from "./remoteok-mapper";
import {
  createSyncLog,
  findOrCreateCompany,
  kebabCase,
  loadCategoriesBySlug,
  loadCompaniesBySlug,
  loadSourcesByName,
  touchSourceLastSynced,
  updateSyncLog,
  upsertJobAR,
  upsertJobEN,
} from "./strapi-write";
import type { JobDraft, SyncResult } from "./types";

const SOURCE_NAME = "RemoteOK";
const DEFAULT_BUDGET = 25;

interface RunOptions {
  maxTranslations?: number;
  /** Skip translations entirely (for fast CI/smoke tests). */
  skipTranslations?: boolean;
  /** Cap how many incoming jobs we attempt this run. Default: all. */
  limit?: number;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

/**
 * HTML → plain-text excerpt: strip tags, decode entities, collapse whitespace, truncate.
 */
function shortText(html: string, maxLen: number): string {
  const stripped = decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length <= maxLen
    ? stripped
    : stripped.slice(0, maxLen - 1).trimEnd() + "…";
}

/**
 * Build EN slug: kebab(title)+last 6 chars of externalId for uniqueness.
 */
function buildEnSlug(title: string, externalId: string): string {
  const base = kebabCase(title) || "job";
  const tail = externalId.replace(/[^a-z0-9]/gi, "").slice(-6).toLowerCase();
  return tail ? `${base}-${tail}` : base;
}

export async function runRemoteokSync(
  options: RunOptions = {}
): Promise<SyncResult> {
  const startedAt = new Date();
  const t0 = Date.now();
  const errors: string[] = [];

  const budget =
    options.maxTranslations ??
    (Number(process.env.MAX_TRANSLATIONS_PER_SYNC) || DEFAULT_BUDGET);
  const skipTranslations = options.skipTranslations ?? false;

  let logId: string | undefined;
  let jobsFound = 0;
  let jobsAdded = 0;
  let jobsUpdated = 0;
  let jobsRejected = 0;
  let jobsTranslated = 0;
  let translationBudgetHit = false;

  try {
    // Preflight: load reference data
    const [sources, categories, companies] = await Promise.all([
      loadSourcesByName(),
      loadCategoriesBySlug(),
      loadCompaniesBySlug(),
    ]);

    const sourceId = sources.get(SOURCE_NAME);
    if (!sourceId) {
      throw new Error(
        `Source "${SOURCE_NAME}" missing in Strapi. Run scripts/seed-jobs-mvp.js.`
      );
    }

    logId = await createSyncLog(SOURCE_NAME);

    // Fetch
    const raw = await fetchRemoteOK();
    jobsFound = raw.length;

    const toProcess = options.limit ? raw.slice(0, options.limit) : raw;

    for (const row of toProcess) {
      let draft: JobDraft;
      try {
        draft = mapRemoteOK(row);
      } catch (e) {
        errors.push(`map ${row.id}: ${(e as Error).message}`);
        continue;
      }

      const halal = checkHalal({
        companyName: draft.companyName,
        description: draft.description,
      });

      try {
        // Company is created for both approved + rejected so admin can see them
        const companyId = await findOrCreateCompany(draft.companyName, companies);

        const categorySlug = classifyByTags(draft.tags, draft.title);
        const jobCategoryId = categorySlug ? categories.get(categorySlug) : undefined;

        const enSlug = buildEnSlug(draft.title, draft.externalId);
        const enDescriptionShort = shortText(draft.description, 200);
        const metaTitleSuffix = " | islam-24.com";
        const enMetaTitle = `${draft.title.slice(0, 60 - metaTitleSuffix.length)}${metaTitleSuffix}`;
        const enMetaDescription =
          draft.description.length > 0
            ? shortText(draft.description, 155)
            : `${draft.title} — Remote job from ${draft.companyName}.`;

        const upsert = await upsertJobEN({
          ...draft,
          status: halal.status,
          halalScore: halal.score,
          halalNotes: halal.notes,
          slug: enSlug,
          descriptionShort: enDescriptionShort,
          metaTitle: enMetaTitle,
          metaDescription: enMetaDescription,
          companyId,
          jobCategoryId,
          sourceId,
        });

        if (upsert.created) jobsAdded++;
        else jobsUpdated++;

        if (!halal.approved) {
          jobsRejected++;
          continue;
        }

        // Approved → translate (if budget remains)
        if (skipTranslations) continue;
        if (jobsTranslated >= budget) {
          translationBudgetHit = true;
          continue;
        }

        try {
          const translation = await translateToArabic({
            title: draft.title,
            description: draft.description,
            company: draft.companyName,
          });
          // Ensure slugAr ends with "-ar" and is locally unique by appending tail
          const arTail = draft.externalId.replace(/[^a-z0-9]/gi, "").slice(-6).toLowerCase();
          const slugAr = translation.slugAr.endsWith(`-${arTail}`)
            ? translation.slugAr
            : `${translation.slugAr}-${arTail || "ar"}`;
          await upsertJobAR({
            documentId: upsert.documentId,
            translation: { ...translation, slugAr },
          });
          jobsTranslated++;
        } catch (e) {
          errors.push(`translate ${draft.externalId}: ${(e as Error).message}`);
        }
      } catch (e) {
        errors.push(`upsert ${draft.externalId}: ${(e as Error).message}`);
      }
    }

    if (sourceId) {
      try {
        await touchSourceLastSynced(sourceId);
      } catch (e) {
        errors.push(`touchSource: ${(e as Error).message}`);
      }
    }
  } catch (fatal) {
    errors.push(`fatal: ${(fatal as Error).message}`);
  }

  const finishedAt = new Date();
  const durationMs = Date.now() - t0;
  const status: "success" | "partial" | "failed" =
    errors.length === 0 ? "success" : jobsAdded + jobsUpdated > 0 ? "partial" : "failed";

  if (logId) {
    try {
      await updateSyncLog(logId, {
        finishedAt: finishedAt.toISOString(),
        durationMs,
        jobsFound,
        jobsAdded,
        jobsUpdated,
        jobsRejected,
        errors: errors.length ? errors.slice(0, 50) : undefined,
        status,
      });
    } catch (e) {
      errors.push(`updateSyncLog: ${(e as Error).message}`);
    }
  }

  return {
    source: SOURCE_NAME,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs,
    jobsFound,
    jobsAdded,
    jobsUpdated,
    jobsRejected,
    jobsTranslated,
    translationBudgetHit,
    errors,
    status,
  };
}
