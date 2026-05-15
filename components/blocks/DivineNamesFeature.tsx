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
      className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-sm"
    >
      <h2 className="font-bold text-lg mb-2">{headline}</h2>
      <p className="text-white/90 text-sm mb-4 leading-relaxed">{body}</p>
      <Link
        href="/asma-allah"
        className="inline-block bg-white text-amber-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors"
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
          <div className="w-1.5 h-7 bg-amber-500 rounded-full" aria-hidden="true" />
          <h2 className="text-lg font-bold text-gray-800">{headline}</h2>
        </div>
        <Link
          href="/asma-allah"
          className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center gap-1"
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
            className="group aspect-square rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-amber-200/60 hover:border-amber-300 flex flex-col items-center justify-center text-center p-2 transition-all hover:shadow-md"
          >
            <span className="text-[10px] text-amber-600 font-semibold">{name.number}</span>
            <span className="text-lg md:text-xl font-bold text-amber-900 leading-tight my-0.5">
              {name.arabic}
            </span>
            <span className="text-[10px] text-amber-700/80 line-clamp-1">{name.transliteration}</span>
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
