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
      className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#070a12_0%,#101b33_58%,#31200c_100%)] text-white p-6 md:p-8 shadow-sm"
    >
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-2 leading-snug">{headline}</h2>
        <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-5">{body}</p>
        <NewsletterForm
          placeholder={placeholder}
          ctaLabel={ctaLabel}
          consentLabel={consentLabel}
          successMessage={successMessage}
        />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[color:var(--site-gold)]" />
    </section>
  );
}
