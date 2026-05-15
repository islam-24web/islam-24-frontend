import Link from "next/link";
import type { AppCard, AppsFeatureBlock } from "@/types/strapi";

interface Props {
  block: AppsFeatureBlock;
}

const TONE_CLASSES: Record<AppCard["tone"], { hover: string; cta: string }> = {
  emerald: { hover: "hover:border-emerald-200", cta: "text-emerald-600" },
  amber: { hover: "hover:border-amber-200", cta: "text-amber-600" },
  neutral: { hover: "hover:border-gray-300", cta: "text-gray-700" },
};

function AppTile({ item }: { item: AppCard }) {
  const tone = TONE_CLASSES[item.tone] ?? TONE_CLASSES.emerald;
  const external = item.open_in_new_tab || /^https?:/i.test(item.href);
  return (
    <Link
      href={item.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all ${tone.hover}`}
    >
      {item.icon && <span className="text-5xl shrink-0">{item.icon}</span>}
      <div className="min-w-0">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
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
        <div className="w-1.5 h-7 bg-emerald-600 rounded-full" aria-hidden="true" />
        <h2 className="text-lg font-bold text-gray-800">{headline}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <AppTile key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
