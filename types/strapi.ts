// ─── Strapi v5 Base Types ────────────────────────────────────────────
// Strapi v5 returns flat objects (no "attributes" wrapper)

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ─── Media (Strapi v5: flat object, no data.attributes wrapper) ─────

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  caption?: string | null;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

// ─── SEO Component ──────────────────────────────────────────────────

export interface SEOComponent {
  id: number;
  meta_title: string;
  meta_description: string;
  og_image?: StrapiMedia | null;
  canonical_url?: string;
  no_index?: boolean;
}

// ─── Navigation ─────────────────────────────────────────────────────

export interface NavLink {
  id: number;
  name: string;
  url: string;
  is_external: boolean;
}

export interface SocialLink {
  id: number;
  platform: "twitter" | "facebook" | "instagram" | "linkedin" | "youtube" | "tiktok" | "github";
  url: string;
}

export interface NavItem {
  id: number;
  label: string;
  href?: string | null;
  is_external: boolean;
  highlight: boolean;
  sub_items: NavLink[];
}

export interface Navigation {
  id: number;
  documentId: string;
  logo: StrapiMedia | null;
  logo_text: string;
  links: NavLink[];
  nav_items?: NavItem[];
  show_date_strip?: boolean;
  tagline_ar?: string | null;
  tagline_en?: string | null;
}

export interface Footer {
  id: number;
  documentId: string;
  copyright_text: string;
  links: NavLink[];
  social_links: SocialLink[];
  description?: string;
}

// ─── Divine Name (Phase C2 entity) ──────────────────────────────────

export interface DivineNameRef {
  id: number;
  documentId: string;
  number: number;
  arabic: string;
  transliteration: string;
  slug: string;
}

export interface DivineName extends DivineNameRef {
  rootLetters?: string | null;
  quickAnswer?: string | null;
  body?: string | null;
  quranOccurrences?: { sura: number; ayah: number }[] | null;
  mercyPair?: DivineNameRef[];
  oppositePair?: DivineNameRef[];
  quranicPair?: DivineNameRef[];
  featuredImage?: StrapiMedia | null;
  audio?: StrapiMedia | null;
  lastReviewedAt?: string | null;
  faqs?: FAQItem[];
  sources?: SourceCitation[];
  seo?: SEOComponent | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Article semantic components (Phase B) ──────────────────────────

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export type SourceKind =
  | "quran"
  | "hadith"
  | "scholarly"
  | "medical"
  | "research"
  | "book"
  | "other";

export interface SourceCitation {
  id: number;
  label: string;
  url?: string | null;
  kind: SourceKind;
  reference?: string | null;
}

// ─── Article ────────────────────────────────────────────────────────

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  quickAnswer?: string | null;
  content: string;
  featured_image: StrapiMedia | null;
  category: Category | null;
  author_name: string;
  author_image: StrapiMedia | null;
  is_featured: boolean;
  published_date: string;
  reading_time: number;
  seo?: SEOComponent | null;
  lastReviewedAt?: string | null;
  faqs?: FAQItem[];
  sources?: SourceCitation[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Category ───────────────────────────────────────────────────────

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  parent: Category | null;
  children: Category[];
  articles: Article[];
  seo?: SEOComponent | null;
}

// ─── Dynamic Zone Blocks ────────────────────────────────────────────

export interface HeroBlock {
  id: number;
  __component: "blocks.hero";
  title: string;
  subtitle?: string;
  background_image?: StrapiMedia | null;
  button_text?: string;
  button_link?: string;
}

export interface TextBlockData {
  id: number;
  __component: "blocks.text-block";
  heading?: string;
  content: string;
}

export interface ImageBlockData {
  id: number;
  __component: "blocks.image-block";
  image: StrapiMedia | null;
  caption?: string;
}

export interface CTABlockData {
  id: number;
  __component: "blocks.cta-block";
  title: string;
  description?: string;
  button_text: string;
  button_link: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ServicesBlockData {
  id: number;
  __component: "blocks.services-block";
  title: string;
  description?: string;
  items: ServiceItem[];
}

export type DynamicZoneBlock =
  | HeroBlock
  | TextBlockData
  | ImageBlockData
  | CTABlockData
  | ServicesBlockData;

// ─── Page ───────────────────────────────────────────────────────────

export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: DynamicZoneBlock[];
  seo?: SEOComponent | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ─── Homepage dynamic-zone blocks ───────────────────────────────────
// Distinct from the page builder's DynamicZoneBlock — homepage uses
// its own block library (editor-curated tiles, category strips, etc.).

export interface DailyTileItem {
  id: number;
  icon?: string | null;
  label: string;
  text: string;
  reference?: string | null;
  tone: "emerald" | "amber";
  href?: string | null;
}

export interface DailyTilesBlock {
  id: number;
  __component: "blocks.daily-tiles";
  headline_ar?: string | null;
  headline_en?: string | null;
  items: DailyTileItem[];
}

export interface CategoryStripBlock {
  id: number;
  __component: "blocks.category-strip";
  category: { id: number; name: string; slug: string } | null;
  headline_ar?: string | null;
  headline_en?: string | null;
  layout: "hero-grid" | "horizontal-scroll" | "three-up";
  limit: number;
  see_more_label?: string | null;
}

export interface HomeHeroBlock {
  id: number;
  __component: "blocks.home-hero";
  mode: "latest-featured" | "hand-picked";
  articles?: Article[];
  variant: "carousel" | "single";
  limit: number;
  eyebrow?: string | null;
}

export interface DivineNamesFeatureBlock {
  id: number;
  __component: "blocks.divine-names-feature";
  mode: "card-cta" | "strip";
  headline_ar?: string | null;
  body_ar?: string | null;
  cta_label?: string | null;
  strip_count: number;
}

export interface AppCard {
  id: number;
  title: string;
  description?: string | null;
  icon?: string | null;
  href: string;
  open_in_new_tab: boolean;
  tone: "emerald" | "amber" | "neutral";
  cta_label?: string | null;
}

export interface AppsFeatureBlock {
  id: number;
  __component: "blocks.apps-feature";
  headline_ar?: string | null;
  headline_en?: string | null;
  items: AppCard[];
}

export type HomeBlock =
  | DailyTilesBlock
  | CategoryStripBlock
  | HomeHeroBlock
  | DivineNamesFeatureBlock
  | AppsFeatureBlock;

export interface Homepage {
  id: number;
  documentId: string;
  sections: HomeBlock[];
  seo?: SEOComponent | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
