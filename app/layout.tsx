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

// /jobs is the only bilingual subtree. Default locale = en (matches
// lib/jobs/i18n parseLocale fallback); ?lang=ar opts into Arabic.
function resolveHtmlLocale(pathname: string, search: string): "ar" | "en" {
  if (!pathname.startsWith("/jobs")) return "ar";
  const lang = new URLSearchParams(search).get("lang");
  return lang === "ar" ? "ar" : "en";
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
  const [navigation, footer] = await Promise.all([getNavigation(), getFooter()]);
  return (
    <html lang={locale} dir={dir} className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col bg-[color:var(--site-bg)] font-sans text-[color:var(--site-text)] antialiased transition-colors">
        <GoogleTagManager gtmId="GTM-PHJ2X8ZN" />
        <JsonLd graph={[buildOrganization(), buildWebsite()]} />
        <SiteHeader navigation={navigation} />
        <main className="flex-1">{children}</main>
        <SiteFooter footer={footer} />
        <GoogleAnalytics gaId="G-148QLR48P0" />
      </body>
    </html>
  );
}
