/**
 * World layer — top-level grouping that turns categories into "knowledge
 * worlds" without introducing a new Strapi content type. Each editorial
 * category belongs to exactly one world. Map-driven so adding or moving
 * a category is a one-line code change and never a schema migration.
 *
 * When a world gets a dedicated route (Phase C5 homepage), point
 * worldHref() at it.
 */

export type World = "faith" | "worship" | "life";

export const WORLDS: readonly World[] = ["faith", "worship", "life"] as const;

export const WORLD_LABELS_AR: Record<World, string> = {
  faith: "العقيدة والمعرفة",
  worship: "العبادات",
  life: "الحياة",
};

export const WORLD_LABELS_EN: Record<World, string> = {
  faith: "Faith & Knowledge",
  worship: "Acts of Worship",
  life: "Life",
};

/**
 * category.slug → world. Categories not listed have no world (null).
 * Keep aligned with backend `api::category.category`. Includes the legacy
 * `category` slug for الأذكار until the C0 cleanup renames it to `adhkar`.
 */
export const CATEGORY_TO_WORLD: Record<string, World> = {
  // faith
  "names-of-allah": "faith",
  "quran-tafsir": "faith",
  "hadith": "faith",
  "seerah": "faith",
  "islamic-names": "faith",
  // worship
  "category": "worship",       // الأذكار — legacy slug, renamed in C0
  "adhkar": "worship",
  "duas": "worship",
  "istikhara-dua": "worship",
  "prayer": "worship",
  "ramadan": "worship",
  "hajj-umrah": "worship",
  "islamic-calendar": "worship",
  "fiqh": "worship",
  // life
  "marriage-family": "life",
  "mental-health": "life",
};

export function worldForCategory(slug: string | null | undefined): World | null {
  if (!slug) return null;
  return CATEGORY_TO_WORLD[slug] ?? null;
}

export function worldLabel(world: World, locale: "ar" | "en" = "en"): string {
  return locale === "ar" ? WORLD_LABELS_AR[world] : WORLD_LABELS_EN[world];
}

/**
 * Until /world/[slug] exists (Phase C5), the homepage is the discovery
 * surface for worlds. Update this when world routes land.
 */
export function worldHref(_world: World): string {
  return "/";
}
