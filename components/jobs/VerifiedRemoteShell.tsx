import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/jobs/api";
import type { Messages } from "@/lib/jobs/i18n";

interface Props {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}

function localeHref(locale: Locale): string {
  return locale === "en" ? "/en" : "/jobs";
}

export default function VerifiedRemoteShell({
  locale,
  messages,
  children,
}: Props) {
  const isArabic = locale === "ar";
  const switchHref = isArabic ? "/en" : "/jobs";
  const switchLabel = isArabic ? messages.localeEnglish : messages.localeArabic;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href={localeHref(locale)} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white">
              VR
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-slate-950">
                Verified Remote
              </span>
              <span className="block text-xs text-teal-700">
                {isArabic ? "فرص مختارة" : "Curated opportunities"}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-slate-700 md:flex">
            <Link href="#latest" className="hover:text-slate-950">
              {messages.latestTitle}
            </Link>
            <Link href="#review" className="hover:text-slate-950">
              {messages.howWeReviewTitle}
            </Link>
            <Link href="#referrals" className="hover:text-slate-950">
              {messages.referralDisclosureTitle}
            </Link>
            <Link href={switchHref} hrefLang={isArabic ? "en" : "ar"} className="hover:text-slate-950">
              {switchLabel}
            </Link>
          </nav>

          <Link
            href="#latest"
            className="shrink-0 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            {messages.browseOpportunities}
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="text-lg font-semibold">Verified Remote</div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {messages.footerIntro}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {messages.footerReviewNote}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {messages.footerReferralNote}
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-100">
              {isArabic ? "روابط مختصرة" : "Short links"}
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <Link href="#latest" className="hover:text-white">
                {messages.latestTitle}
              </Link>
              <Link href="#review" className="hover:text-white">
                {messages.howWeReviewTitle}
              </Link>
              <Link href="#referrals" className="hover:text-white">
                {messages.referralDisclosureTitle}
              </Link>
              <Link href="/privacy-policy" className="hover:text-white">
                {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 text-xs text-slate-400 md:col-span-2">
            {messages.parentSiteNote}
          </div>
        </div>
      </footer>
    </div>
  );
}
