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
 * applicantLocationRequirements quirk: Google's Rich Results validator
 * errors when a TELECOMMUTE job omits it (despite the schema.org spec
 * marking it optional). We always emit at least ["Worldwide"] for remote
 * jobs; for ONSITE/HYBRID we strip "Worldwide" because jobLocation carries
 * the real geographic info.
 */
export function buildJobPosting({
  job,
  canonicalUrl,
  locale,
}: JobPostingInput): SchemaNode {
  const node: SchemaNode = {
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.name ?? "Unknown",
    },
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    jobLocationType: job.jobLocationType,
    directApply: false,
    url: canonicalUrl,
    inLanguage: locale,
    identifier: {
      "@type": "PropertyValue",
      name: "islam-24.com Job ID",
      value: job.documentId,
    },
    isPartOf: { "@id": SCHEMA_IDS.website },
  };

  if (job.jobLocationType === "TELECOMMUTE") {
    const reqs =
      job.applicantLocationRequirements.length > 0
        ? job.applicantLocationRequirements
        : ["Worldwide"];
    node.applicantLocationRequirements = reqs.map((r) => ({
      "@type": "Country",
      name: r,
    }));
  } else {
    const reqs = job.applicantLocationRequirements.filter(
      (r) => r && r.toLowerCase() !== "worldwide",
    );
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
      addressCountry: job.physicalLocation.country,
    };
    if (job.physicalLocation.region) address.addressRegion = job.physicalLocation.region;
    if (job.physicalLocation.city) address.addressLocality = job.physicalLocation.city;
    node.jobLocation = { "@type": "Place", address };
  }

  if (job.salaryMin > 0 || job.salaryMax > 0) {
    const value: SchemaNode = {
      "@type": "QuantitativeValue",
      unitText: job.salaryUnit ?? "YEAR",
    };
    if (job.salaryMin > 0) value.minValue = job.salaryMin;
    if (job.salaryMax > 0) value.maxValue = job.salaryMax;
    node.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency || "USD",
      value,
    };
  }

  return node;
}
