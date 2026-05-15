import type { FAQItem } from "@/types/strapi";
import type { SchemaNode } from "./core";

/**
 * FAQPage node. Each FAQ becomes a Question with an Answer.
 *
 * The answer.text is the rich HTML from CKEditor as authored — Google's
 * FAQPage spec accepts HTML in acceptedAnswer.text. Editors should write
 * concise, self-contained answers (1-3 sentences) for AEO eligibility.
 *
 * Caller supplies a stable @id (typically the article canonical URL +
 * "#faq") so the article BlogPosting can reference this node via mainEntity.
 */
export function buildFAQPage(faqs: FAQItem[], id: string): SchemaNode | null {
  const valid = faqs.filter(
    (f) => f.question?.trim() && f.answer?.trim(),
  );
  if (valid.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer.trim(),
      },
    })),
  };
}
