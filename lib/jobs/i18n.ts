import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./api";

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function parseLocale(input: string | string[] | undefined): Locale {
  const v = Array.isArray(input) ? input[0] : input;
  return SUPPORTED_LOCALES.includes(v as Locale)
    ? (v as Locale)
    : DEFAULT_LOCALE;
}

export interface Messages {
  pageTitle: string;
  pageSubtitle: string;
  heroKicker: string;
  heroTitle: string;
  heroBody: string;
  referralNotice: string;
  latestTitle: string;
  latestSubtitle: string;
  howWeReviewTitle: string;
  howWeReviewBody: string;
  trustPanelTitle: string;
  trustSourceLabel: string;
  trustManualLabel: string;
  trustDetailsLabel: string;
  referralDisclosureTitle: string;
  footerIntro: string;
  footerReviewNote: string;
  footerReferralNote: string;
  parentSiteNote: string;
  browseOpportunities: string;
  filterCategory: string;
  filterCategoryAll: string;
  filterSearch: string;
  filterRemoteOnly: string;
  filterClear: string;
  localeEnglish: string;
  localeArabic: string;
  apply: string;
  applyAt: string;
  remote: string;
  postedOn: string;
  validUntil: string;
  salaryNotSpecified: string;
  noJobsTitle: string;
  noJobsBody: string;
  errorLoading: string;
  backToList: string;
  summary: string;
  responsibilities: string;
  requirements: string;
  contractDetails: string;
  sourceDetails: string;
  sourceReviewedAt: string;
  sourceUrl: string;
  applicationUrl: string;
  locationEligibility: string;
  safetyNoteTitle: string;
  safetyNote: string;
  referralDisclosure: string;
  status: string;
  contractType: string;
  remoteType: string;
  payText: string;
  originalTitle: string;
  hiringOrganization: string;
  jobDetails: string;
  paginationPrev: string;
  paginationNext: string;
  paginationPageOf: string;
}

export const messages: Record<Locale, Messages> = {
  ar: {
    pageTitle: "Verified Remote",
    pageSubtitle:
      "فرص عمل عن بُعد نختارها بعناية، ومن مصادر موثوقة. وننشرها بعد مراجعة مصدرها.",
    heroKicker: "فرص عالمية عن بُعد",
    heroTitle: "فرص مختارة بعناية للباحثين عن عمل عن بُعد",
    heroBody:
      "نراجع المصدر قبل النشر، ونلخص أهم التفاصيل التي تحتاجها لاتخاذ قرار واضح قبل التقديم.",
    referralNotice:
      "قد تحتوي بعض الروابط على إحالة، وقد نحصل على مكافأة إذا تم قبولك من خلالها، بدون أي تكلفة عليك.",
    latestTitle: "أحدث الفرص المختارة",
    latestSubtitle: "فرص منشورة بعد مراجعة المصدر واكتمال بيانات التقديم.",
    howWeReviewTitle: "كيف نراجع الفرص",
    howWeReviewBody:
      "نتحقق من مصدر الفرصة، رابط التقديم، اسم الشركة، وتاريخ المراجعة. أي فرصة ناقصة تبقى خارج النشر حتى تكتمل بياناتها.",
    trustPanelTitle: "معايير النشر",
    trustSourceLabel: "مصدر موثوق",
    trustManualLabel: "مراجعة يدوية",
    trustDetailsLabel: "تفاصيل واضحة",
    referralDisclosureTitle: "تنبيه الإحالات",
    footerIntro: "Verified Remote منصة مختصرة لفرص العمل عن بُعد التي تمر بمراجعة قبل النشر.",
    footerReviewNote:
      "اقرأ دائمًا تفاصيل الوظيفة الرسمية قبل إرسال بياناتك.",
    footerReferralNote: "بعض روابط التقديم قد تكون روابط إحالة بدون تكلفة عليك.",
    parentSiteNote: "مشروع مستقل مستضاف ضمن islam-24.com",
    browseOpportunities: "تصفح الفرص",
    filterCategory: "التصنيف",
    filterCategoryAll: "جميع التصنيفات",
    filterSearch: "ابحث عن فرصة...",
    filterRemoteOnly: "عن بُعد فقط",
    filterClear: "مسح المرشحات",
    localeEnglish: "English",
    localeArabic: "العربية",
    apply: "تقديم",
    applyAt: "قدِّم عبر المصدر",
    remote: "عن بُعد",
    postedOn: "تاريخ النشر: {date}",
    validUntil: "صالحة حتى: {date}",
    salaryNotSpecified: "غير محدد",
    noJobsTitle: "لا توجد فرص منشورة حاليًا",
    noJobsBody: "ننشر فقط الفرص التي نراجع مصدرها يدويًا.",
    errorLoading: "تعذّر تحميل الفرص الآن. حاول بعد قليل.",
    backToList: "كل الفرص",
    summary: "ملخص الفرصة",
    responsibilities: "المهام",
    requirements: "المتطلبات",
    contractDetails: "تفاصيل العقد والدفع",
    sourceDetails: "تفاصيل المصدر",
    sourceReviewedAt: "تاريخ مراجعة المصدر",
    sourceUrl: "المصدر الرسمي",
    applicationUrl: "رابط التقديم",
    locationEligibility: "نطاق الأهلية الجغرافية",
    safetyNoteTitle: "تنبيه أمان",
    safetyNote:
      "لا تدفع أي رسوم للتقديم. وتأكد دائمًا من قراءة تفاصيل الوظيفة الرسمية قبل إرسال بياناتك.",
    referralDisclosure:
      "قد يحتوي رابط التقديم على إحالة، وقد أحصل على مكافأة إذا تم قبولك من خلاله، بدون أي تكلفة عليك.",
    status: "الحالة",
    contractType: "نوع العقد",
    remoteType: "نظام العمل عن بُعد",
    payText: "الأجر",
    originalTitle: "العنوان الأصلي",
    hiringOrganization: "الجهة المُوظِّفة",
    jobDetails: "تفاصيل الفرصة",
    paginationPrev: "السابق",
    paginationNext: "التالي",
    paginationPageOf: "الصفحة {current} من {total}",
  },
  en: {
    pageTitle: "Verified Remote",
    pageSubtitle:
      "Carefully selected remote opportunities from trusted sources, shared after reviewing the source.",
    heroKicker: "Global remote opportunities",
    heroTitle: "Curated remote roles for focused applicants",
    heroBody:
      "We review the source before publishing and present the key details clearly so you can decide before applying.",
    referralNotice:
      "Some links may be referral links. We may receive a reward if you are accepted through them, at no cost to you.",
    latestTitle: "Latest Verified Opportunities",
    latestSubtitle: "Published only after source review and complete application details.",
    howWeReviewTitle: "How We Review",
    howWeReviewBody:
      "We check the source, application link, company, and review date. Incomplete opportunities stay unpublished until the required details are ready.",
    trustPanelTitle: "Publishing standards",
    trustSourceLabel: "Trusted source",
    trustManualLabel: "Manual review",
    trustDetailsLabel: "Clear details",
    referralDisclosureTitle: "Referral Disclosure",
    footerIntro: "Verified Remote is a focused remote jobs project built around reviewed sources and clear details.",
    footerReviewNote:
      "Always read the official job details before submitting your information.",
    footerReferralNote: "Some application links may be referral links at no cost to you.",
    parentSiteNote: "An independent project hosted under islam-24.com",
    browseOpportunities: "Browse Opportunities",
    filterCategory: "Category",
    filterCategoryAll: "All categories",
    filterSearch: "Search opportunities...",
    filterRemoteOnly: "Remote only",
    filterClear: "Clear filters",
    localeEnglish: "English",
    localeArabic: "العربية",
    apply: "Apply",
    applyAt: "Apply at source",
    remote: "Remote",
    postedOn: "Posted {date}",
    validUntil: "Valid until {date}",
    salaryNotSpecified: "Not specified",
    noJobsTitle: "No verified opportunities are available right now",
    noJobsBody: "We only publish roles after reviewing their source.",
    errorLoading:
      "We couldn't load verified opportunities right now. Please try again in a moment.",
    backToList: "All opportunities",
    summary: "Summary",
    responsibilities: "Responsibilities",
    requirements: "Requirements",
    contractDetails: "Contract and payment details",
    sourceDetails: "Source details",
    sourceReviewedAt: "Source reviewed",
    sourceUrl: "Official source",
    applicationUrl: "Application link",
    locationEligibility: "Location eligibility",
    safetyNoteTitle: "Safety note",
    safetyNote:
      "Do not pay any fees to apply. Always review the official job details before submitting your information.",
    referralDisclosure:
      "This application link may be a referral link. I may receive a reward if you are accepted through it, at no cost to you.",
    status: "Status",
    contractType: "Contract type",
    remoteType: "Remote type",
    payText: "Pay",
    originalTitle: "Original title",
    hiringOrganization: "Hiring organization",
    jobDetails: "Opportunity details",
    paginationPrev: "Previous",
    paginationNext: "Next",
    paginationPageOf: "Page {current} of {total}",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}

export function t(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const tag = locale === "ar" ? "ar" : "en-US";
  return new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

const SALARY_UNIT_LABELS: Record<string, { en: string; ar: string }> = {
  HOUR: { en: "hour", ar: "ساعة" },
  DAY: { en: "day", ar: "يوم" },
  WEEK: { en: "week", ar: "أسبوع" },
  MONTH: { en: "month", ar: "شهر" },
  YEAR: { en: "year", ar: "سنة" },
};

function formatSalaryUnit(unit: string | null | undefined, locale: Locale): string {
  const u =
    SALARY_UNIT_LABELS[String(unit ?? "").toUpperCase()] ??
    SALARY_UNIT_LABELS.YEAR;
  return locale === "ar" ? u.ar : u.en;
}

export function formatSalaryRange(
  min: number,
  max: number,
  currency: string | null,
  unit: string | null,
  locale: Locale,
): string | null {
  const validMin = Number.isFinite(min) && min > 0 ? min : null;
  const validMax = Number.isFinite(max) && max > 0 ? max : null;
  if (validMin === null && validMax === null) return null;

  const tag = locale === "ar" ? "ar" : "en-US";
  const fmt = (n: number) =>
    new Intl.NumberFormat(tag, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const unitText = formatSalaryUnit(unit, locale);
  if (validMin !== null && validMax !== null && validMin !== validMax) {
    return `${fmt(validMin)} - ${fmt(validMax)} / ${unitText}`;
  }
  return `${fmt((validMin ?? validMax) as number)} / ${unitText}`;
}
