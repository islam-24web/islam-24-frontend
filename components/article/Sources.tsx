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
        className="text-2xl font-bold tracking-tight text-gray-900 mb-6"
      >
        {heading}
      </h2>
      <ol className="space-y-3 text-sm sm:text-base text-gray-700 list-decimal ps-6">
        {sources.map((s) => (
          <li key={s.id} className="leading-relaxed">
            <span className="me-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {labels[s.kind]}
            </span>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="nofollow noopener"
                className="font-medium text-blue-700 hover:underline"
              >
                {s.label}
              </a>
            ) : (
              <span className="font-medium text-gray-900">{s.label}</span>
            )}
            {s.reference && (
              <span className="ms-1 text-gray-500"> — {s.reference}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
