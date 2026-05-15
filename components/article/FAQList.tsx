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
        className="text-2xl font-bold tracking-tight text-gray-900 mb-6"
      >
        {heading}
      </h2>
      <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        {faqs.map((faq, i) => (
          <details
            key={faq.id}
            className="group p-5 sm:p-6 [&_summary::-webkit-details-marker]:hidden"
            open={i === 0}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base sm:text-lg font-semibold text-gray-900">
              <span>{faq.question}</span>
              <span className="text-gray-400 transition-transform group-open:rotate-45 text-xl leading-none select-none">
                +
              </span>
            </summary>
            <div
              className="prose-article mt-3 text-gray-700"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
