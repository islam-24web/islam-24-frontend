import Link from "next/link";
import type { DailyTilesBlock, DailyTileItem } from "@/types/strapi";

interface Props {
  block: DailyTilesBlock;
}

const TONE_CLASSES: Record<DailyTileItem["tone"], { card: string; pill: string; text: string; ref: string }> = {
  emerald: {
    card: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
    pill: "bg-emerald-600 text-white",
    text: "text-emerald-900",
    ref: "text-emerald-600",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    pill: "bg-amber-500 text-white",
    text: "text-amber-900",
    ref: "text-amber-600",
  },
};

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
        {item.icon && <span className="text-2xl">{item.icon}</span>}
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
        <h2 className="text-lg font-bold text-gray-800 mb-3">{block.headline_ar}</h2>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <Tile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
