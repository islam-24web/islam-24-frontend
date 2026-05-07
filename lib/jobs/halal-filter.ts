/**
 * Halal filter — keyword + override list scoring.
 *
 * Score scale:
 *   100 → halal override matched (e.g. Islamic finance)         → APPROVE
 *    80 → no haram terms detected                                → APPROVE
 *    40 → 1 haram keyword present (FLAG, manual review)          → REJECT, kept for review
 *    10 → 2+ haram keywords present                              → REJECT
 *     0 → company is on the haram list                           → REJECT
 *
 * Rejected entries are still saved to Strapi (status: rejected_halal)
 * so the team can audit/restore via admin.
 */

const HARAM_COMPANIES: readonly string[] = [
  // Conventional banks (riba)
  "goldman sachs",
  "jpmorgan",
  "morgan stanley",
  "citigroup",
  "bank of america",
  "wells fargo",
  "hsbc",
  // Gambling
  "draftkings",
  "fanduel",
  "pokerstars",
  "bet365",
  "mgm resorts",
  // Alcohol & tobacco
  "anheuser-busch",
  "diageo",
  "constellation brands",
  "philip morris",
  "british american tobacco",
  // Adult content
  "onlyfans",
  "pornhub",
];

const HARAM_KEYWORDS: readonly string[] = [
  // Banking
  "interest-based banking",
  "conventional banking",
  "investment banking",
  "derivatives trading",
  "forex broker",
  // Gambling
  "casino",
  "gambling",
  "sports betting",
  "lottery",
  "poker site",
  // Alcohol
  "brewery",
  "distillery",
  "winery",
  "liquor",
  "beer brand",
  // Tobacco / cannabis
  "tobacco",
  "cigarette",
  "vape",
  "cannabis",
  "marijuana dispensary",
  // Adult
  "adult content",
  "adult entertainment",
  "escort",
  // Music as primary business
  "record label",
  "music label",
];

const HALAL_OVERRIDES: readonly string[] = [
  "islamic bank",
  "islamic finance",
  "takaful",
  "sharia-compliant",
  "al rajhi",
  "alinma",
  "tabby",
  "tamara",
  "wahed invest",
];

export interface HalalDecision {
  approved: boolean;
  score: 0 | 10 | 40 | 80 | 100;
  status: "active" | "rejected_halal";
  notes: string;
  matched: string[];
}

export interface HalalFilterInput {
  companyName: string;
  description: string;
}

/**
 * Strips HTML tags (cheap pass) and lowercases, so keyword scans hit text content.
 */
function normalize(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .toLowerCase();
}

export function checkHalal(input: HalalFilterInput): HalalDecision {
  const companyLower = (input.companyName || "").toLowerCase();
  const descLower = normalize(input.description || "");
  const haystack = `${companyLower} ${descLower}`;

  // 1. Halal override wins — Islamic finance, takaful, etc.
  const overrides = HALAL_OVERRIDES.filter((t) => haystack.includes(t));
  if (overrides.length > 0) {
    return {
      approved: true,
      score: 100,
      status: "active",
      notes: `halal override matched: ${overrides.join(", ")}`,
      matched: overrides,
    };
  }

  // 2. Hard reject by company name
  const haramCompanyHits = HARAM_COMPANIES.filter((c) =>
    companyLower.includes(c)
  );
  if (haramCompanyHits.length > 0) {
    return {
      approved: false,
      score: 0,
      status: "rejected_halal",
      notes: `haram company: ${haramCompanyHits.join(", ")}`,
      matched: haramCompanyHits,
    };
  }

  // 3. Keyword scan
  const keywordHits = HARAM_KEYWORDS.filter((k) => haystack.includes(k));
  if (keywordHits.length >= 2) {
    return {
      approved: false,
      score: 10,
      status: "rejected_halal",
      notes: `${keywordHits.length} haram keywords: ${keywordHits.join(", ")}`,
      matched: keywordHits,
    };
  }
  if (keywordHits.length === 1) {
    // FLAG — single keyword, kept for human review
    return {
      approved: false,
      score: 40,
      status: "rejected_halal",
      notes: `1 haram keyword (review needed): ${keywordHits[0]}`,
      matched: keywordHits,
    };
  }

  // 4. Clean
  return {
    approved: true,
    score: 80,
    status: "active",
    notes: "no haram terms detected",
    matched: [],
  };
}
