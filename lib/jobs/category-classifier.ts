/**
 * Tag/title-based job classifier.
 * Returns the EN slug of the best-matching category from the seeded set.
 * Returns null if no signal — sync runner can default to "software-engineering" or skip categorization.
 */

const KEYWORD_TO_CATEGORY: Record<string, string> = {
  // AI / ML
  "ai": "ai-machine-learning",
  "machine learning": "ai-machine-learning",
  "ml": "ai-machine-learning",
  "mlops": "ai-machine-learning",
  "deep learning": "ai-machine-learning",
  "nlp": "ai-machine-learning",
  "computer vision": "ai-machine-learning",
  "llm": "ai-machine-learning",
  "genai": "ai-machine-learning",
  "ai engineer": "ai-machine-learning",

  // Software Engineering
  "software": "software-engineering",
  "engineer": "software-engineering",
  "engineering": "software-engineering",
  "developer": "software-engineering",
  "backend": "software-engineering",
  "back end": "software-engineering",
  "frontend": "software-engineering",
  "front end": "software-engineering",
  "full stack": "software-engineering",
  "fullstack": "software-engineering",
  "mobile": "software-engineering",
  "ios": "software-engineering",
  "android": "software-engineering",
  "devops": "software-engineering",
  "sre": "software-engineering",
  "platform": "software-engineering",

  // Data & Analytics
  "data": "data-analytics",
  "analytics": "data-analytics",
  "analyst": "data-analytics",
  "data scientist": "data-analytics",
  "data engineer": "data-analytics",
  "bi": "data-analytics",
  "business intelligence": "data-analytics",

  // Design & UX
  "design": "design-ux",
  "designer": "design-ux",
  "ux": "design-ux",
  "ui": "design-ux",
  "product designer": "design-ux",
  "graphic": "design-ux",

  // Marketing & SEO
  "marketing": "marketing-seo",
  "seo": "marketing-seo",
  "content marketing": "marketing-seo",
  "growth": "marketing-seo",
  "performance marketing": "marketing-seo",

  // Sales & Business
  "sales": "sales-business",
  "business development": "sales-business",
  "account executive": "sales-business",
  "account manager": "sales-business",
  "partnerships": "sales-business",

  // Medical Writing
  "medical writer": "medical-writing",
  "medical writing": "medical-writing",
  "medical": "medical-writing",
  "healthcare": "medical-writing",
  "pharma": "medical-writing",
  "clinical": "medical-writing",
  "regulatory writer": "medical-writing",

  // Customer Support
  "support": "customer-support",
  "customer success": "customer-support",
  "customer service": "customer-support",
  "operations": "customer-support",
};

/**
 * Score each category by counting tag/title hits and return the highest.
 * Tag exact-match weighs more than substring match in title.
 */
export function classifyByTags(
  tags: string[],
  title: string
): string | null {
  const normalizedTags = tags.map((t) => String(t).toLowerCase().trim());
  const normalizedTitle = title.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [keyword, category] of Object.entries(KEYWORD_TO_CATEGORY)) {
    for (const tag of normalizedTags) {
      if (tag === keyword) scores[category] = (scores[category] || 0) + 3;
      else if (tag.includes(keyword)) scores[category] = (scores[category] || 0) + 1;
    }
    if (normalizedTitle.includes(keyword)) {
      scores[category] = (scores[category] || 0) + 2;
    }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0 || ranked[0][1] === 0) return null;
  return ranked[0][0];
}
