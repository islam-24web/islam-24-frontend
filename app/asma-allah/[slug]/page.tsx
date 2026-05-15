import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getDivineNameBySlug,
  getAllDivineNameSlugs,
  getAllDivineNames,
} from "@/lib/divine-names/api";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd, type SchemaNode } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";
import { buildDefinedTerm } from "@/lib/seo/schema/defined-term";
import { buildFAQPage } from "@/lib/seo/schema/faq-page";
import QuickAnswer from "@/components/article/QuickAnswer";
import FAQList from "@/components/article/FAQList";
import Sources from "@/components/article/Sources";
import PairedNamesPanel from "@/components/asma-allah/PairedNamesPanel";
import { addHeadingAnchors } from "@/lib/article/headings";

const SITE_URL = getSiteUrl();

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllDivineNameSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = await getDivineNameBySlug(params.slug);
  if (!name) return { title: "غير موجود" };
  const title = `${name.arabic} — الاسم ${name.number} من أسماء الله الحسنى`;
  const description =
    name.quickAnswer?.trim() ||
    name.seo?.meta_description ||
    `الاسم رقم ${name.number} من أسماء الله الحسنى. الشرح، المعنى، وروده في القرآن والسنة.`;
  const canonical = `${SITE_URL}/asma-allah/${params.slug}`;
  return {
    title: name.seo?.meta_title || title,
    description,
    alternates: { canonical: name.seo?.canonical_url || canonical },
    robots: name.seo?.no_index ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
    },
  };
}

export default async function DivineNamePage({ params }: Props) {
  const name = await getDivineNameBySlug(params.slug);
  if (!name) notFound();

  const all = await getAllDivineNames();
  const sorted = [...all].sort((a, b) => a.number - b.number);
  const idx = sorted.findIndex((n) => n.slug === name.slug);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const canonical = `${SITE_URL}/asma-allah/${params.slug}`;
  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Faith & Knowledge", url: SITE_URL },
    { name: "Asma Allah", url: `${SITE_URL}/asma-allah` },
    { name: name.arabic, url: canonical },
  ];

  const { html: body } = addHeadingAnchors(name.body || "");

  const faqPageId = name.faqs && name.faqs.length > 0 ? `${canonical}#faq` : undefined;
  const faqNode = name.faqs && faqPageId ? buildFAQPage(name.faqs, faqPageId) : null;
  const termNode = buildDefinedTerm(name);
  if (faqPageId) termNode.mainEntity = { "@id": faqPageId };

  const graph: SchemaNode[] = [termNode, buildBreadcrumb(breadcrumbs)];
  if (faqNode) graph.push(faqNode);

  const pairGroups = [
    { label: "الرحمة المقترنة", names: name.mercyPair || [] },
    { label: "الأسماء المتقابلة", names: name.oppositePair || [] },
    { label: "ورود في القرآن متلازمًا", names: name.quranicPair || [] },
  ];

  return (
    <>
      <JsonLd graph={graph} />

      <article dir="rtl">
        <header className="py-12 sm:py-16 border-b border-gray-100">
          <div className="mx-auto max-w-3xl px-6">
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="breadcrumb">
              <Link href="/" className="hover:text-gray-700">الرئيسية</Link>
              <span>/</span>
              <Link href="/asma-allah" className="hover:text-gray-700">أسماء الله الحسنى</Link>
            </nav>

            <p className="text-xs font-mono uppercase tracking-wider text-gray-400">
              الاسم رقم {name.number}
            </p>
            <h1 className="mt-3 text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-none">
              {name.arabic}
            </h1>
            <p className="mt-4 text-base text-gray-500">
              {name.transliteration}
              {name.rootLetters ? (
                <>
                  <span className="mx-3 text-gray-300">·</span>
                  <span>الجذر: <span className="font-mono">{name.rootLetters}</span></span>
                </>
              ) : null}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 py-10">
          {name.quickAnswer && <QuickAnswer answer={name.quickAnswer} locale="ar" />}

          {body && (
            <div className="prose-article" dangerouslySetInnerHTML={{ __html: body }} />
          )}

          <PairedNamesPanel groups={pairGroups} />
        </div>

        {name.faqs && name.faqs.length > 0 && <FAQList faqs={name.faqs} locale="ar" />}
        {name.sources && name.sources.length > 0 && <Sources sources={name.sources} locale="ar" />}

        {(prev || next) && (
          <nav
            className="mx-auto max-w-3xl px-6 pb-16 flex items-center justify-between gap-4"
            aria-label="ترتيب الأسماء"
            dir="rtl"
          >
            {prev ? (
              <Link
                href={`/asma-allah/${prev.slug}`}
                className="group flex-1 rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="text-xs text-gray-400 mb-1">السابق · {prev.number}</p>
                <p className="font-bold text-gray-900 group-hover:text-blue-700">{prev.arabic}</p>
              </Link>
            ) : <span className="flex-1" />}
            {next ? (
              <Link
                href={`/asma-allah/${next.slug}`}
                className="group flex-1 rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="text-xs text-gray-400 mb-1">التالي · {next.number}</p>
                <p className="font-bold text-gray-900 group-hover:text-blue-700">{next.arabic}</p>
              </Link>
            ) : <span className="flex-1" />}
          </nav>
        )}
      </article>
    </>
  );
}
