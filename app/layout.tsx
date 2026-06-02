import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Instrument_Serif, Noto_Kufi_Arabic } from "next/font/google";
import * as Sentry from '@sentry/nextjs';
import { getNavigation, getFooter } from "@/lib/api";
import { DEFAULT_OG_IMAGE, SITE_NAME_AR, getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildOrganization } from "@/lib/seo/schema/organization";
import { buildWebsite } from "@/lib/seo/schema/website";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ThemeScript from "@/components/theme/ThemeScript";
import "./globals.css";

const sans = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], variable: "--font-serif", display: "swap" });
const SITE_URL = getSiteUrl();

function resolveHtmlLocale(pathname: string, search: string): "ar" | "en" {
  if (!isVerifiedRemoteRoute(pathname)) return "ar";
  const lang = new URLSearchParams(search).get("lang");
  return lang === "en" || pathname.startsWith("/en") ? "en" : "ar";
}

function isVerifiedRemoteRoute(pathname: string): boolean {
  return (
    pathname === "/jobs" ||
    pathname.startsWith("/jobs/") ||
    pathname === "/en" ||
    pathname === "/en/jobs" ||
    pathname.startsWith("/en/jobs/")
  );
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME_AR, template: `%s | ${SITE_NAME_AR}` },
    description: "موقع إسلامي شامل: القرآن الكريم، الحديث النبوي، الفقه، السيرة، أسماء الله الحسنى، الأدعية والأذكار",
    openGraph: {
      type: "website",
      locale: "ar_EG",
      siteName: SITE_NAME_AR,
      images: [{ url: DEFAULT_OG_IMAGE.url, width: DEFAULT_OG_IMAGE.width, height: DEFAULT_OG_IMAGE.height }],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
    robots: { index: true, follow: true },
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = headers();
  const pathname = h.get("x-pathname") ?? "/";
  const locale = resolveHtmlLocale(pathname, h.get("x-search") ?? "");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isVerifiedRemote = isVerifiedRemoteRoute(pathname);
  const [navigation, footer] = isVerifiedRemote
    ? [null, null]
    : await Promise.all([getNavigation(), getFooter()]);
  return (
    <html lang={locale} dir={dir} className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col bg-[color:var(--site-bg)] font-sans text-[color:var(--site-text)] antialiased transition-colors">
        <GoogleTagManager gtmId="GTM-PHJ2X8ZN" />
        {isVerifiedRemote ? null : (
          <JsonLd graph={[buildOrganization(), buildWebsite()]} />
        )}
        {isVerifiedRemote ? null : <SiteHeader navigation={navigation} />}
        <main className="flex-1">{children}</main>
        {isVerifiedRemote ? null : <SiteFooter footer={footer} />}
        <GoogleAnalytics gaId="G-148QLR48P0" />
      </body>
    </html>
  );
}
