import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { DEFAULT_OG_IMAGE, SITE_NAME_AR, getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildOrganization } from "@/lib/seo/schema/organization";
import { buildWebsite } from "@/lib/seo/schema/website";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], variable: "--font-serif", display: "swap" });
const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900 antialiased">
        <GoogleTagManager gtmId="GTM-PHJ2X8ZN" />
        <JsonLd graph={[buildOrganization(), buildWebsite()]} />
        <main className="flex-1">{children}</main>
        <GoogleAnalytics gaId="G-148QLR48P0" />
      </body>
    </html>
  );
}