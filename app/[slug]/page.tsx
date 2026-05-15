import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getPages, getStrapiMediaUrl } from "@/lib/api";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";

const SITE_URL = getSiteUrl();

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const pages = await getPages();
    return pages
      .filter((p) => p.slug !== "home")
      .map((page) => ({ slug: page.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) return { title: "Page Not Found" };

  const seo = page.seo;
  const ogImage = seo?.og_image?.url;

  return {
    title: seo?.meta_title || page.title,
    description: seo?.meta_description,
    alternates: { canonical: seo?.canonical_url || `${SITE_URL}/${params.slug}` },
    robots: seo?.no_index ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo?.meta_title || page.title,
      description: seo?.meta_description || undefined,
      url: `${SITE_URL}/${params.slug}`,
      type: "website",
      images: ogImage ? [{ url: getStrapiMediaUrl(ogImage) }] : undefined,
    },
  };
}

export default async function DynamicPage({ params }: Props) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <>
      <JsonLd
        graph={[
          buildBreadcrumb([
            { name: "Home", url: SITE_URL },
            { name: page.title, url: `${SITE_URL}/${params.slug}` },
          ]),
        ]}
      />
      {page.content && page.content.length > 0 ? (
        <BlockRenderer blocks={page.content} />
      ) : (
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{page.title}</h1>
          </div>
        </section>
      )}
    </>
  );
}
