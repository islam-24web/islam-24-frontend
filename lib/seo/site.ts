/**
 * Single source of truth for site-wide SEO constants.
 *
 * Use getSiteUrl() instead of reading process.env.NEXT_PUBLIC_SITE_URL directly,
 * so we never have to chase trailing slashes or fallback inconsistencies again.
 */

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.islam-24.com";

const SITE_URL = RAW_SITE_URL.replace(/\/$/, "");

export function getSiteUrl(): string {
  return SITE_URL;
}

export const SITE_NAME_AR = "إسلام 24";
export const SITE_NAME_EN = "Islam 24";

/**
 * Verified social/profile URLs for Organization.sameAs.
 * Populate as accounts are claimed. Anything in here is emitted into JSON-LD
 * site-wide, so only add URLs we'd be comfortable Google indexing as official.
 */
export const SITE_PROFILES: readonly string[] = [
  // TODO: add LinkedIn / X / YouTube / Facebook / Wikidata URLs when ready
];

/**
 * Default OG image used as fallback when a page does not provide its own.
 * Cloudinary-hosted to keep it off the Strapi origin and immutable.
 */
export const DEFAULT_OG_IMAGE = {
  url: "https://res.cloudinary.com/dcnvz21jt/image/upload/v1778254210/islam_24_logo_7e6cebc72b.webp",
  width: 1200,
  height: 630,
} as const;

/**
 * Publisher logo per Google Article structured-data spec (fits in 60x600).
 */
export const PUBLISHER_LOGO = {
  url: "https://res.cloudinary.com/dcnvz21jt/image/upload/v1778254210/islam_24_logo_7e6cebc72b.webp",
  width: 600,
  height: 60,
} as const;
