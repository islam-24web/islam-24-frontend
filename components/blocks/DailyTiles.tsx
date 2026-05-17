import Link from "next/link";
import type { ReactElement, SVGProps } from "react";
import type { DailyTilesBlock, DailyTileItem } from "@/types/strapi";

interface Props {
  block: DailyTilesBlock;
}

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

const TONE_CLASSES: Record<DailyTileItem["tone"], { card: string; pill: string; text: string; ref: string; icon: string }> = {
  emerald: {
    card: "daily-card daily-card-blue",
    pill: "daily-pill-blue",
    text: "daily-text",
    ref: "daily-ref",
    icon: "bg-[color:var(--site-surface)] text-[color:var(--site-accent)]",
  },
  amber: {
    card: "daily-card daily-card-gold",
    pill: "daily-pill-gold",
    text: "daily-text",
    ref: "daily-ref",
    icon: "bg-[color:var(--site-surface)] text-[color:var(--site-gold)]",
  },
};

const ICONS: Record<string, IconComponent> = {
  feather: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="m16 8-9.5 9.5" />
      <path d="M17.5 15H9" />
    </svg>
  ),
  "book-open": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 7v14" />
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z" />
    </svg>
  ),
  book: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  ),
  star: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.88L18.18 21 12 17.77 5.82 21 7 14.15l-5-4.88 6.91-1.01z" />
    </svg>
  ),
  moon: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  ),
  sun: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  lightbulb: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.7.55-1.2 1.32-1.38 2.2H9.88c-.18-.88-.68-1.65-1.38-2.2Z" />
    </svg>
  ),
  sparkle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2z" />
    </svg>
  ),
  sparkles: (props) => ICONS.sparkle(props),
};

function normalizeIconName(icon: string): string {
  return icon.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function DailyTileIcon({ icon, tone }: { icon: string | null | undefined; tone: (typeof TONE_CLASSES)[DailyTileItem["tone"]] }) {
  if (!icon) return null;

  const normalized = normalizeIconName(icon);
  const Icon = ICONS[normalized] ?? (normalized.match(/^[a-z0-9-]+$/) ? ICONS.sparkle : null);

  return (
    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.icon}`} aria-hidden="true">
      {Icon ? <Icon className="h-5 w-5" /> : <span className="text-2xl leading-none">{icon}</span>}
    </span>
  );
}

// Editors occasionally save tile hrefs under the legacy plural paths
// (/articles/<slug>, /categories/<slug>) which never existed as real routes
// and were a top source of 404-from-homepage Ahrefs errors. Rewrite to the
// canonical singular form at render time so the emitted HTML is correct
// even before/without the next.config.js 301 catches it.
function normalizeHref(href: string): string {
  if (href.startsWith("/articles/")) return "/article/" + href.slice("/articles/".length);
  if (href.startsWith("/categories/")) return "/category/" + href.slice("/categories/".length);
  return href;
}

function Tile({ item }: { item: DailyTileItem }) {
  const tone = TONE_CLASSES[item.tone] ?? TONE_CLASSES.emerald;
  const inner = (
    <div
      className={`rounded-xl p-4 border hover:shadow-md transition-shadow h-full ${tone.card}`}
    >
      <div className="flex items-center justify-between mb-2">
        <DailyTileIcon icon={item.icon} tone={tone} />
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tone.pill}`}>
          {item.label}
        </span>
      </div>
      <p className={`text-sm font-semibold leading-relaxed line-clamp-3 ${tone.text}`}>
        {item.text}
      </p>
      {item.reference && (
        <p className={`text-xs mt-2 ${tone.ref}`}>{item.reference}</p>
      )}
    </div>
  );
  return item.href ? (
    <Link href={normalizeHref(item.href)} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function DailyTiles({ block }: Props) {
  const items = block.items ?? [];
  if (items.length === 0) return null;
  return (
    <section aria-label={block.headline_ar || "Daily content"}>
      {block.headline_ar && (
        <h2 className="site-section-title text-lg font-bold mb-4">{block.headline_ar}</h2>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Tile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
