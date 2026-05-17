interface QuickAnswerProps {
  answer: string;
  locale?: "ar" | "en";
  speakable?: boolean;
}

export default function QuickAnswer({
  answer,
  locale = "ar",
  speakable = false,
}: QuickAnswerProps) {
  const label = locale === "ar" ? "إجابة سريعة" : "Quick answer";
  const isRtl = locale === "ar";

  return (
    <aside
      className="article-quick-answer mb-10 rounded-2xl border p-5 sm:p-6 shadow-sm"
      aria-label={label}
      dir={isRtl ? "rtl" : "ltr"}
      data-speakable-summary={speakable ? true : undefined}
    >
      <p className="article-accent text-xs font-semibold uppercase">
        {label}
      </p>
      <p className="article-primary mt-2 text-base sm:text-lg font-medium leading-[2]">
        {answer}
      </p>
    </aside>
  );
}
