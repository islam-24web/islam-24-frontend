/**
 * Shared types for the jobs sync pipeline.
 */

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTOR"
  | "TEMPORARY"
  | "INTERN"
  | "VOLUNTEER"
  | "PER_DIEM"
  | "OTHER";

export type JobLocationType = "TELECOMMUTE" | "ONSITE" | "HYBRID";

export type SalaryUnit = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";

export type JobStatus =
  | "active"
  | "expired"
  | "rejected_halal"
  | "rejected_quality"
  | "draft";

/**
 * Mapped form of an external job before halal/translation/upsert.
 * Locale-neutral fields only.
 */
export interface JobDraft {
  externalId: string;
  title: string;
  description: string;
  companyName: string;
  sourceUrl: string;
  applyUrl: string;
  datePosted: string; // ISO 8601
  validThrough: string; // ISO 8601
  tags: string[];
  employmentType: EmploymentType;
  jobLocationType: JobLocationType;
  applicantLocationRequirements?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryUnit?: SalaryUnit;
  salaryUSDMin?: number;
  salaryUSDMax?: number;
}

export interface ArabicTranslation {
  titleAr: string;
  descriptionAr: string;
  descriptionShortAr: string;
  metaTitleAr: string;
  metaDescriptionAr: string;
  slugAr: string;
}

export interface SyncResult {
  source: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  jobsFound: number;
  jobsAdded: number;
  jobsUpdated: number;
  jobsRejected: number;
  jobsTranslated: number;
  translationBudgetHit: boolean;
  errors: string[];
  status: "success" | "partial" | "failed";
}
