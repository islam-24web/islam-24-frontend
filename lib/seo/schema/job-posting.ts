import type { Job, Locale } from "@/lib/jobs/api";
import type { SalaryUnit } from "@/lib/jobs/types";
import { SCHEMA_IDS, type SchemaNode } from "./core";

export interface JobPostingInput {
  job: Job;
  canonicalUrl: string;
  locale: Locale;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
};

const CURRENCY_WORDS: Record<string, string> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
};

const SALARY_UNITS: Array<[RegExp, SalaryUnit]> = [
  [/\b(hour|hourly|hr|hrs)\b|ساعة|بالساعة/i, "HOUR"],
  [/\b(day|daily)\b|يوم|يومي/i, "DAY"],
  [/\b(week|weekly)\b|أسبوع|اسبوع|أسبوعي|اسبوعي/i, "WEEK"],
  [/\b(month|monthly)\b|شهر|شهري/i, "MONTH"],
  [/\b(year|yearly|annual|annually|salary)\b|سنة|سنوي/i, "YEAR"],
];

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const value = raw.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function splitLocationRequirements(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getApplicantLocationRequirements(job: Job): string[] {
  const fromArray = Array.isArray(job.applicantLocationRequirements)
    ? job.applicantLocationRequirements.map((value) => String(value))
    : [];
  const fromEligibility = splitLocationRequirements(job.locationEligibility);
  const requirements = uniqueNonEmpty([...fromArray, ...fromEligibility]);

  if (job.jobLocationType === "TELECOMMUTE" && requirements.length === 0) {
    return ["Worldwide"];
  }

  return requirements;
}

function getSalaryUnitFromPayText(payText: string): SalaryUnit | null {
  const match = SALARY_UNITS.find(([pattern]) => pattern.test(payText));
  return match?.[1] ?? null;
}

function getSalaryCurrencyFromPayText(payText: string): string | null {
  const symbol = Object.keys(CURRENCY_SYMBOLS).find((s) => payText.includes(s));
  if (symbol) return CURRENCY_SYMBOLS[symbol];

  const lowered = payText.toLowerCase();
  const word = Object.keys(CURRENCY_WORDS).find((currency) =>
    new RegExp(`\\b${currency}\\b`, "i").test(lowered),
  );
  return word ? CURRENCY_WORDS[word] : null;
}

function getSalaryNumbersFromPayText(payText: string): number[] {
  return [...payText.matchAll(/\d+(?:[,.]\d+)?/g)]
    .map(([value]) => Number(value.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function buildBaseSalary(job: Job): SchemaNode | null {
  const salaryCurrency =
    job.salaryCurrency?.trim() ||
    (job.payText ? getSalaryCurrencyFromPayText(job.payText) : null);

  if (!salaryCurrency) return null;

  const payTextSalaryUnit = job.payText
    ? getSalaryUnitFromPayText(job.payText)
    : null;
  const salaryUnit = payTextSalaryUnit || job.salaryUnit || null;
  const value: SchemaNode = {
    "@type": "QuantitativeValue",
  };

  if (salaryUnit) value.unitText = salaryUnit;

  if (job.salaryMin > 0 || job.salaryMax > 0) {
    if (job.salaryMin > 0) value.minValue = job.salaryMin;
    if (job.salaryMax > 0) value.maxValue = job.salaryMax;
  } else if (job.payText) {
    const numbers = getSalaryNumbersFromPayText(job.payText);
    if (numbers.length >= 2) {
      value.minValue = numbers[0];
      value.maxValue = numbers[1];
    } else if (numbers.length === 1) {
      value.value = numbers[0];
    }
  }

  if (!("value" in value) && !("minValue" in value) && !("maxValue" in value)) {
    return null;
  }

  return {
    "@type": "MonetaryAmount",
    currency: salaryCurrency,
    value,
  };
}

/**
 * JobPosting node. hiringOrganization is intentionally NOT the site
 * Organization — it's the company offering the job. Google requires it.
 *
 * Optional properties are only emitted when the source job carries a real
 * value, except remote applicant location: Google requires at least one
 * eligible area for TELECOMMUTE jobs, so fully remote jobs fall back to
 * Worldwide when the CMS has not provided a narrower eligibility value.
 */
export function buildJobPosting({
  job,
  canonicalUrl,
  locale,
}: JobPostingInput): SchemaNode {
  const description = [
    job.summary,
    job.responsibilities,
    job.requirements,
    job.contractDetails,
  ]
    .filter((part) => part?.trim())
    .join("\n\n") || job.description?.trim();

  const node: SchemaNode = {
    "@type": "JobPosting",
    title: job.title?.trim(),
    description,
    datePosted: job.datePosted,
    validThrough: job.expiresAt || job.validThrough,
    employmentType: job.employmentType,
    jobLocationType: job.jobLocationType,
    directApply: false,
    url: canonicalUrl,
    inLanguage: locale,
    identifier: {
      "@type": "PropertyValue",
      name: "Verified Remote Job ID",
      value: job.documentId?.trim(),
    },
    isPartOf: { "@id": SCHEMA_IDS.website },
  };

  const companyName = job.company?.name?.trim();
  if (companyName) {
    node.hiringOrganization = {
      "@type": "Organization",
      name: companyName,
    };
  }

  const applicantLocationRequirements = getApplicantLocationRequirements(job);

  if (job.jobLocationType === "TELECOMMUTE") {
    const reqs = applicantLocationRequirements;
    node.applicantLocationRequirements = reqs.map((r) => ({
      "@type": "Country",
      name: r,
    }));
  } else {
    const reqs = applicantLocationRequirements
      .map((r) => r.trim())
      .filter((r) => r && r.toLowerCase() !== "worldwide");
    if (reqs.length > 0) {
      node.applicantLocationRequirements = reqs.map((r) => ({
        "@type": "Country",
        name: r,
      }));
    }
  }

  if (job.physicalLocation) {
    const address: SchemaNode = {
      "@type": "PostalAddress",
    };
    if (job.physicalLocation.country?.trim()) {
      address.addressCountry = job.physicalLocation.country.trim();
    }
    if (job.physicalLocation.region?.trim()) {
      address.addressRegion = job.physicalLocation.region.trim();
    }
    if (job.physicalLocation.city?.trim()) {
      address.addressLocality = job.physicalLocation.city.trim();
    }
    if (address.addressCountry) node.jobLocation = { "@type": "Place", address };
  }

  const baseSalary = buildBaseSalary(job);
  if (baseSalary) node.baseSalary = baseSalary;

  return node;
}
