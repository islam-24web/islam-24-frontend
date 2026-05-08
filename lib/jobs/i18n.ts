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
  noJobsTranslating: string;
  errorLoading: string;
  backToList: string;
  fullDescription: string;
  hiringOrganization: string;
  jobDetails: string;
  paginationPrev: string;
  paginationNext: string;
  paginationPageOf: string;
}

export const messages: Record<Locale, Messages> = {
  en: {
    pageTitle: "Jobs",
    pageSubtitle: "Halal-filtered remote jobs, refreshed daily.",
    filterCategory: "Category",
    filterCategoryAll: "All categories",
    filterSearch: "Search jobs…",
    filterRemoteOnly: "Remote only",
    filterClear: "Clear filters",
    localeEnglish: "English",
    localeArabic: "العربية",
    apply: "Apply",
    applyAt: "Apply on {source}",
    remote: "Remote",
    postedOn: "Posted {date}",
    validUntil: "Valid until {date}",
    salaryNotSpecified: "—",
    noJobsTitle: "No jobs match your filters",
    noJobsBody:
      "Try clearing filters or search terms — the next sync runs daily at 05:00 UTC.",
    noJobsTranslating:
      "Arabic translations are being added gradually. Check back soon.",
    errorLoading:
      "We couldn't load jobs right now. Please try again in a moment.",
    backToList: "← All jobs",
    fullDescription: "Job description",
    hiringOrganization: "Hiring organization",
    jobDetails: "Job details",
    paginationPrev: "Previous",
    paginationNext: "Next",
    paginationPageOf: "Page {current} of {total}",
  },
  ar: {
    pageTitle: "الوظائف",
    pageSubtitle: "وظائف عن بُعد مفلترة وفق الضوابط الشرعية، تُحدَّث يومياً.",
    filterCategory: "التصنيف",
    filterCategoryAll: "جميع التصنيفات",
    filterSearch: "ابحث عن وظائف…",
    filterRemoteOnly: "عن بُعد فقط",
    filterClear: "مسح المرشحات",
    localeEnglish: "English",
    localeArabic: "العربية",
    apply: "تقديم",
    applyAt: "قدِّم عبر {source}",
    remote: "عن بُعد",
    postedOn: "تاريخ النشر: {date}",
    validUntil: "صالحة حتى: {date}",
    salaryNotSpecified: "غير محدد",
    noJobsTitle: "لا توجد وظائف تطابق المرشحات",
    noJobsBody:
      "جرّب مسح المرشحات أو كلمات البحث — تحديث الوظائف يجري يومياً في الساعة 05:00 بتوقيت UTC.",
    noJobsTranslating:
      "الترجمات إلى العربية تُضاف تدريجياً. تابعنا قريباً.",
    errorLoading: "تعذّر تحميل الوظائف الآن. حاول بعد قليل.",
    backToList: "→ كل الوظائف",
    fullDescription: "وصف الوظيفة",
    hiringOrganization: "الجهة المُوظِّفة",
    jobDetails: "تفاصيل الوظيفة",
    paginationPrev: "السابق",
    paginationNext: "التالي",
    paginationPageOf: "الصفحة {current} من {total}",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en;
}

export function t(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export function formatDate(iso: string, locale: Locale): string {
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
    return `${fmt(validMin)} – ${fmt(validMax)} / ${unitText}`;
  }
  return `${fmt((validMin ?? validMax) as number)} / ${unitText}`;
}
