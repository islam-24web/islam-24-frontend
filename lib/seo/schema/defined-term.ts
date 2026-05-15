import type { DivineName } from "@/types/strapi";
import { getSiteUrl } from "../site";
import { SCHEMA_IDS, type SchemaNode } from "./core";

/**
 * DefinedTerm node for an Asma Allah entity. Reused for any future entity
 * whose semantic shape is "a named concept with a definition" (scholarly
 * terms, doctrinal concepts, etc.).
 *
 * inDefinedTermSet groups the 99 names as members of a single conceptual
 * vocabulary, referenced by @id for cross-page consistency.
 */
export function buildDefinedTerm(name: DivineName): SchemaNode {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/asma-allah/${name.slug}`;

  const node: SchemaNode = {
    "@type": "DefinedTerm",
    "@id": `${canonical}#term`,
    name: name.arabic,
    alternateName: name.transliteration,
    identifier: `${name.number}`,
    url: canonical,
    inLanguage: "ar",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": `${siteUrl}/asma-allah#set`,
      name: "أسماء الله الحسنى",
      url: `${siteUrl}/asma-allah`,
    },
    publisher: { "@id": SCHEMA_IDS.organization },
  };

  if (name.quickAnswer?.trim()) {
    node.description = name.quickAnswer.trim();
  }

  if (name.lastReviewedAt) {
    node.dateModified = name.lastReviewedAt;
  }

  return node;
}
