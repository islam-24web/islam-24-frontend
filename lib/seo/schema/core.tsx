/**
 * Schema core — the only piece of the SEO layer that other builders depend on.
 *
 * Conventions for every builder in this directory:
 *   1. Pure function. Takes a typed input, returns Record<string, unknown>.
 *   2. Never reads env or globals directly; uses helpers from ../site.ts.
 *   3. Does NOT include "@context" — JsonLd adds it at render time.
 *   4. Uses SCHEMA_IDS for site-level singletons (Organization, WebSite)
 *      so they are defined once per page and referenced by @id elsewhere.
 */

import type { ReactElement } from "react";
import { getSiteUrl } from "../site";

const SITE_URL = getSiteUrl();

export const SCHEMA_IDS = {
  organization: `${SITE_URL}#organization`,
  website: `${SITE_URL}#website`,
} as const;

export type SchemaNode = Record<string, unknown>;

interface JsonLdProps {
  graph: SchemaNode[];
}

/**
 * Renders one <script type="application/ld+json"> per call, wrapping the
 * provided nodes in a single @graph. Empty graph renders nothing.
 */
export function JsonLd({ graph }: JsonLdProps): ReactElement | null {
  if (!graph || graph.length === 0) return null;
  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
