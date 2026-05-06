import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { getNavigation } from "@/lib/api";
import { WebsiteJsonLd } from "@/components/seo/StructuredData";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], variable: "--font-serif", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.islam-24.com";
const SITE_NAME = "إسلام 24";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "موقع إسلامي شامل: القرآن الكريم، الحديث النبوي، الفقه، السيرة، أسماء الله الحسنى، الأدعية والأذكار",
  openGraph: { type: "website", locale: "ar_EG", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navigation = await getNavigation();

  return (
    <html lang="ar" dir="rtl" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900 antialiased">
        <WebsiteJsonLd name={SITE_NAME} url={SITE_URL} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
