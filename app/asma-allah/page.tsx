import type { Metadata } from "next";
import Link from "next/link";
import { getAllDivineNames } from "@/lib/divine-names/api";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";
import { buildItemList } from "@/lib/seo/schema/item-list";

const SITE_URL = getSiteUrl();
const PAGE_URL = `${SITE_URL}/asma-allah`;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "أسماء الله الحسنى — التسعة والتسعون اسمًا كاملة بالشرح والمعاني",
  description:
    "موسوعة أسماء الله الحسنى التسعة والتسعين كاملة: اللفظ بالعربية، النطق، الجذر، المعنى، وردها في القرآن والسنة، والأسماء المقترنة. مرجع منظم من الكتاب والسنة وأقوال العلماء.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "أسماء الله الحسنى",
    description:
      "التسعة والتسعون اسمًا — مرجع كامل بالعربية والإنجليزية مع الشرح والمصادر.",
  },
};

export default async function AsmaAllahIndex() {
  const names = await getAllDivineNames();
  const sorted = [...names].sort((a, b) => a.number - b.number);

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Faith & Knowledge", url: SITE_URL },
    { name: "Asma Allah", url: PAGE_URL },
  ];

  const itemList = buildItemList(
    sorted.map((n) => ({
      url: `${SITE_URL}/asma-allah/${n.slug}`,
      name: n.arabic,
    })),
  );

  return (
    <>
      <JsonLd graph={[buildBreadcrumb(breadcrumbs), itemList]} />

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16" dir="rtl">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            موسوعة
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            أسماء الله الحسنى
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            التسعة والتسعون اسمًا — كل اسم بمعناه ودلالاته، وما ورد فيه من
            الكتاب والسنة وأقوال العلماء.
          </p>
        </header>

        {sorted.length === 0 ? (
          <p className="text-center text-gray-500 py-20">
            لم تُحمَّل البيانات بعد. تحقق من اتصال Strapi.
          </p>
        ) : (
          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          >
            {sorted.map((name) => (
              <li key={name.id}>
                <Link
                  href={`/asma-allah/${name.slug}`}
                  className="group block rounded-xl border border-gray-200 bg-white px-3 py-5 text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                  aria-label={`الاسم ${name.number}: ${name.arabic}`}
                >
                  <span className="block text-xs font-mono text-gray-400">
                    {name.number}
                  </span>
                  <span className="mt-2 block text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {name.arabic}
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs text-gray-500">
                    {name.transliteration}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
