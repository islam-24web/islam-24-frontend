interface QuickAnswerProps {
  answer: string;
  locale?: "ar" | "en";
}

export default function QuickAnswer({ answer, locale = "ar" }: QuickAnswerProps) {
  const label = locale === "ar" ? "إجابة سريعة" : "Quick answer";
  const isRtl = locale === "ar";

  return (
    <aside
      className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6 shadow-sm"
      aria-label={label}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </p>
      <p className="mt-2 text-base sm:text-lg leading-relaxed text-gray-900">
        {answer}
      </p>
    </aside>
  );
}
