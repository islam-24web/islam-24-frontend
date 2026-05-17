import { SITE_NAME_AR, SITE_NAME_EN, getSiteUrl } from "../site";
import { SCHEMA_IDS, type SchemaNode } from "./core";

export function buildWebsite(): SchemaNode {
  const siteUrl = getSiteUrl();
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url: siteUrl,
    inLanguage: ["ar", "en"],
    publisher: { "@id": SCHEMA_IDS.organization },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
