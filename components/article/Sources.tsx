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
        className="article-title mb-6 text-2xl font-extrabold leading-relaxed"
      >
        {heading}
      </h2>
      <ol className="article-primary space-y-3 text-sm sm:text-base list-decimal ps-6">
        {sources.map((s) => (
          <li key={s.id} className="leading-[2]">
            <span className="article-reference-pill me-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium">
              {labels[s.kind]}
            </span>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="nofollow noopener"
                className="article-accent font-semibold hover:underline"
              >
                {s.label}
              </a>
            ) : (
              <span className="article-title font-semibold">{s.label}</span>
            )}
            {s.reference && (
              <span className="article-muted ms-1"> — {s.reference}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
