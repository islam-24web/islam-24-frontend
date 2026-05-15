import {
  PUBLISHER_LOGO,
  SITE_NAME_AR,
  SITE_NAME_EN,
  SITE_PROFILES,
  getSiteUrl,
} from "../site";
import { SCHEMA_IDS, type SchemaNode } from "./core";

/**
 * Site-wide Organization node. Emitted once at the root layout so every
 * page graph can reference it by @id (publisher, author fallback, etc.).
 */
export function buildOrganization(): SchemaNode {
  const node: SchemaNode = {
    "@type": "Organization",
    "@id": SCHEMA_IDS.organization,
    name: SITE_NAME_AR,
    alternateName: [SITE_NAME_EN, "Islam24"],
    url: getSiteUrl(),
    logo: {
      "@type": "ImageObject",
      url: PUBLISHER_LOGO.url,
      width: PUBLISHER_LOGO.width,
      height: PUBLISHER_LOGO.height,
    },
  };
  if (SITE_PROFILES.length > 0) {
    node.sameAs = [...SITE_PROFILES];
  }
  return node;
}
