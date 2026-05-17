import Link from "next/link";
import type { AppCard, AppsFeatureBlock } from "@/types/strapi";

interface Props {
  block: AppsFeatureBlock;
}

const TONE_CLASSES: Record<AppCard["tone"], { hover: string; cta: string }> = {
  emerald: { hover: "hover:border-[color:var(--site-accent)]", cta: "text-[color:var(--site-accent)]" },
  amber: { hover: "hover:border-[color:var(--site-gold)]", cta: "text-[color:var(--site-gold)]" },
  neutral: { hover: "hover:border-[color:var(--site-border)]", cta: "text-[color:var(--site-muted)]" },
};

function normalizeHref(href: string): string {
  if (href.startsWith("/articles/")) return "/article/" + href.slice("/articles/".length);
  if (href.startsWith("/categories/")) return "/category/" + href.slice("/categories/".length);
  return href;
}

function AppTile({ item }: { item: AppCard }) {
  const tone = TONE_CLASSES[item.tone] ?? TONE_CLASSES.emerald;
  const external = item.open_in_new_tab || /^https?:/i.test(item.href);
  return (
    <Link
      href={normalizeHref(item.href)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`content-card group flex items-center gap-4 rounded-xl p-5 transition-all ${tone.hover}`}
    >
      {item.icon && <span className="text-5xl shrink-0">{item.icon}</span>}
      <div className="min-w-0">
        <h3 className="content-card-title text-base font-bold transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="site-muted text-xs mt-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
        {item.cta_label && (
          <span className={`inline-block mt-2 text-xs font-medium ${tone.cta}`}>
            {item.cta_label}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function AppsFeature({ block }: Props) {
  const items = block.items ?? [];
  if (items.length === 0) return null;
  const headline = block.headline_ar || "تطبيقاتنا الإسلامية";
  return (
    <section aria-label={headline}>
      <div className="flex items-center gap-3 mb-4">
        <div className="site-section-kicker w-1.5 h-7 rounded-full" aria-hidden="true" />
        <h2 className="site-section-title text-lg font-bold">{headline}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <AppTile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
