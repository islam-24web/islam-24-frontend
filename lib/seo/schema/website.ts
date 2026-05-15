import { SITE_NAME_AR, SITE_NAME_EN, getSiteUrl } from "../site";
import { SCHEMA_IDS, type SchemaNode } from "./core";

/**
 * Site-wide WebSite node. No SearchAction emitted — the platform does not
 * have a site-wide search endpoint yet. Add it back if/when /search lands.
 */
export function buildWebsite(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url: getSiteUrl(),
    inLanguage: ["ar", "en"],
    publisher: { "@id": SCHEMA_IDS.organization },
  };
}
