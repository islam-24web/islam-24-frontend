import type { NewsletterCtaBlock } from "@/types/strapi";
import NewsletterForm from "./NewsletterForm";

interface Props {
  block: NewsletterCtaBlock;
}

export default function NewsletterCta({ block }: Props) {
  if (block.enabled === false) return null;

  const headline = block.headline_ar || "اشترك في نشرتنا الإسلامية";
  const body =
    block.body_ar ||
    "محتوى أسبوعي مختار: مقالات جديدة، اسم الله الحسنى للأسبوع، أذكار، وأدعية.";
  const placeholder = block.placeholder || "بريدك الإلكتروني";
  const ctaLabel = block.cta_label || "اشترك";
  const consentLabel =
    block.consent_label ||
    "أوافق على تلقي رسائل من إسلام 24 ويمكنني إلغاء الاشتراك في أي وقت.";
  const successMessage = block.success_message || "شكراً! تم تسجيل بريدك بنجاح.";

  return (
    <section
      aria-label={headline}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 md:p-8 shadow-sm"
    >
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-2 leading-snug">{headline}</h2>
        <p className="text-emerald-100 text-sm md:text-base leading-relaxed mb-5">{body}</p>
        <NewsletterForm
          placeholder={placeholder}
          ctaLabel={ctaLabel}
          consentLabel={consentLabel}
          successMessage={successMessage}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl"
      />
    </section>
  );
}
