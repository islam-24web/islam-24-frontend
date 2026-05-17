import Link from "next/link";
import { getAllDivineNames } from "@/lib/divine-names/api";
import type { DivineNamesFeatureBlock } from "@/types/strapi";

interface Props {
  block: DivineNamesFeatureBlock;
}

function CardCta({ block }: { block: DivineNamesFeatureBlock }) {
  const headline = block.headline_ar || "🌟 أسماء الله الحسنى";
  const body = block.body_ar || "تعرف على أسماء الله الحسنى الـ ٩٩ ومعانيها وآثارها الإيمانية";
  const cta = block.cta_label || "تصفح الأسماء ←";
  return (
    <section
      aria-label="أسماء الله الحسنى"
      className="rounded-xl bg-[linear-gradient(135deg,#101b33_0%,#31200c_100%)] text-white p-6 shadow-sm"
    >
      <h2 className="font-bold text-lg mb-2">{headline}</h2>
      <p className="text-white/90 text-sm mb-4 leading-relaxed">{body}</p>
      <Link
        href="/asma-allah"
        className="inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-[color:var(--site-gold)]"
      >
        {cta}
      </Link>
    </section>
  );
}

async function Strip({ block }: { block: DivineNamesFeatureBlock }) {
  const count = Math.max(3, Math.min(12, block.strip_count ?? 9));
  const all = await getAllDivineNames();
  const names = all.slice(0, count);
  if (names.length === 0) return <CardCta block={block} />;

  const headline = block.headline_ar || "🌟 أسماء الله الحسنى";
  const cta = block.cta_label || "تصفح كل الأسماء الـ ٩٩";

  return (
    <section aria-label="أسماء الله الحسنى">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="site-section-kicker w-1.5 h-7 rounded-full" aria-hidden="true" />
          <h2 className="site-section-title text-lg font-bold">{headline}</h2>
        </div>
        <Link
          href="/asma-allah"
          className="site-section-link text-sm font-bold flex items-center gap-1 transition-colors"
        >
          {cta}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
        {names.map((name) => (
          <Link
            key={name.documentId}
            href={`/asma-allah/${name.slug}`}
            className="content-card group aspect-square rounded-xl flex flex-col items-center justify-center text-center p-2 transition-all"
          >
            <span className="text-[10px] text-[color:var(--site-gold)] font-semibold">{name.number}</span>
            <span className="text-lg md:text-xl font-bold text-[color:var(--site-heading)] leading-tight my-0.5">
              {name.arabic}
            </span>
            <span className="text-[10px] text-[color:var(--site-muted)] line-clamp-1">{name.transliteration}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DivineNamesFeature({ block }: Props) {
  if (block.mode === "strip") {
    return <Strip block={block} />;
  }
  return <CardCta block={block} />;
}
