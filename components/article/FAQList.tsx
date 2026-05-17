import type { FAQItem } from "@/types/strapi";

interface FAQListProps {
  faqs: FAQItem[];
  locale?: "ar" | "en";
}

export default function FAQList({ faqs, locale = "ar" }: FAQListProps) {
  if (!faqs?.length) return null;
  const heading = locale === "ar" ? "أسئلة شائعة" : "Frequently asked questions";
  const isRtl = locale === "ar";

  return (
    <section
      className="mx-auto max-w-3xl px-6 pb-12"
      aria-labelledby="faq-heading"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h2
        id="faq-heading"
        className="article-title mb-6 text-2xl font-extrabold leading-relaxed"
      >
        {heading}
      </h2>
      <div className="article-faq-panel divide-y divide-[color:var(--article-border)] rounded-2xl border">
        {faqs.map((faq, i) => (
          <details
            key={faq.id}
            className="group p-5 sm:p-6 [&_summary::-webkit-details-marker]:hidden"
            open={i === 0}
          >
            <summary className="article-title flex cursor-pointer items-center justify-between gap-4 text-base font-bold leading-relaxed sm:text-lg">
              <span>{faq.question}</span>
              <span className="article-accent transition-transform group-open:rotate-45 text-xl leading-none select-none">
                +
              </span>
            </summary>
            <div
              className="prose-article mt-3"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
