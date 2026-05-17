import type { SourceCitation, SourceKind } from "@/types/strapi";

const KIND_LABELS_AR: Record<SourceKind, string> = {
  quran: "قرآن",
  hadith: "حديث",
  scholarly: "علمي",
  medical: "طبي",
  research: "بحث",
  book: "كتاب",
  other: "مرجع",
};

const KIND_LABELS_EN: Record<SourceKind, string> = {
  quran: "Quran",
  hadith: "Hadith",
  scholarly: "Scholarly",
  medical: "Medical",
  research: "Research",
  book: "Book",
  other: "Source",
};

interface SourcesProps {
  sources: SourceCitation[];
  locale?: "ar" | "en";
}

export default function Sources({ sources, locale = "ar" }: SourcesProps) {
  if (!sources?.length) return null;
  const heading = locale === "ar" ? "المصادر" : "Sources";
  const labels = locale === "ar" ? KIND_LABELS_AR : KIND_LABELS_EN;
  const isRtl = locale === "ar";

  return (
    <section
      className="mx-auto max-w-3xl px-6 pb-16"
      aria-labelledby="sources-heading"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h2
        id="sources-heading"
        className="mb-6 text-2xl font-extrabold leading-relaxed text-white"
      >
        {heading}
      </h2>
      <ol className="space-y-3 text-sm sm:text-base text-slate-200 list-decimal ps-6">
        {sources.map((s) => (
          <li key={s.id} className="leading-[2]">
            <span className="me-2 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-amber-200">
              {labels[s.kind]}
            </span>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="nofollow noopener"
                className="font-semibold text-amber-200 hover:underline"
              >
                {s.label}
              </a>
            ) : (
              <span className="font-semibold text-white">{s.label}</span>
            )}
            {s.reference && (
              <span className="ms-1 text-slate-300"> — {s.reference}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
