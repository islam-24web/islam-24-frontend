import type { Job, Locale } from "@/lib/jobs/api";
import { SCHEMA_IDS, type SchemaNode } from "./core";

export interface JobPostingInput {
  job: Job;
  canonicalUrl: string;
  locale: Locale;
}

/**
 * JobPosting node. hiringOrganization is intentionally NOT the site
 * Organization — it's the company offering the job. Google requires it.
 *
 * Optional properties are only emitted when the source job carries a real
 * value. We do not synthesize fallback organizations, currencies, or locations
 * because fake required values create schema errors that are harder to trust.
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

  const applicantLocationRequirements = Array.isArray(
    job.applicantLocationRequirements,
  )
    ? job.applicantLocationRequirements
    : [];

  if (job.jobLocationType === "TELECOMMUTE") {
    const reqs = applicantLocationRequirements
      .map((r) => r.trim())
      .filter(Boolean);
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

  if ((job.salaryMin > 0 || job.salaryMax > 0) && job.salaryCurrency?.trim()) {
    const value: SchemaNode = {
      "@type": "QuantitativeValue",
    };
    if (job.salaryUnit) value.unitText = job.salaryUnit;
    if (job.salaryMin > 0) value.minValue = job.salaryMin;
    if (job.salaryMax > 0) value.maxValue = job.salaryMax;
    node.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency.trim(),
      value,
    };
  }

  return node;
}
