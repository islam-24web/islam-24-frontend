import type { Metadata } from "next";
import Link from "next/link";
import { fetchJobs, fetchJobCategories } from "@/lib/jobs/api";
import { getDir, getMessages, parseLocale } from "@/lib/jobs/i18n";
import { getSiteUrl } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildItemList } from "@/lib/seo/schema/item-list";
import JobsFilters from "@/components/jobs/JobsFilters";
import JobCard from "@/components/jobs/JobCard";
import Pagination from "@/components/ui/Pagination";

interface Props {
  searchParams: {
    lang?: string;
    category?: string;
    q?: string;
    remote?: string;
    page?: string;
  };
}

const SITE_URL = getSiteUrl();

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const locale = parseLocale(searchParams.lang);
  const messages = getMessages(locale);
  const canonical =
    locale === "en" ? `${SITE_URL}/jobs` : `${SITE_URL}/jobs?lang=${locale}`;
  return {
    title: messages.pageTitle,
    description: messages.pageSubtitle,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/jobs`,
        ar: `${SITE_URL}/jobs?lang=ar`,
        "x-default": `${SITE_URL}/jobs`,
      },
    },
    openGraph: {
      title: messages.pageTitle,
      description: messages.pageSubtitle,
      url: canonical,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
  };
}

export default async function JobsPage({ searchParams }: Props) {
  const locale = parseLocale(searchParams.lang);
  const messages = getMessages(locale);
  const dir = getDir(locale);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const categorySlug = searchParams.category;
  const search = searchParams.q;
  const remoteOnly = searchParams.remote === "1";

  const [{ jobs, pagination }, categories] = await Promise.all([
    fetchJobs({ locale, page, categorySlug, search, remoteOnly }),
    fetchJobCategories(locale),
  ]);

  const paginationExtra = new URLSearchParams();
  if (locale !== "en") paginationExtra.set("lang", locale);
  if (categorySlug) paginationExtra.set("category", categorySlug);
  if (search) paginationExtra.set("q", search);
  if (remoteOnly) paginationExtra.set("remote", "1");

  const isAREmpty = locale === "ar" && pagination.total === 0 && !search && !categorySlug;

  // Internal-link affordances. Even when the listing is empty (the common
  // case for ?lang=ar while translations roll in), every page must still
  // emit anchor tags — Ahrefs flagged /jobs?lang=ar for "page has no
  // outgoing links" because the empty-state was a bare <div>.
  const otherLocale: typeof locale = locale === "ar" ? "en" : "ar";
  const switcherHref = otherLocale === "en" ? "/jobs" : "/jobs?lang=ar";
  const switcherLabel =
    otherLocale === "en" ? messages.localeEnglish : messages.localeArabic;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir={dir} lang={locale}>
      <header className="mb-8">
        <nav className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span aria-hidden>·</span>
          <Link href={switcherHref} className="hover:text-gray-700" hrefLang={otherLocale}>
            {switcherLabel}
          </Link>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {messages.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{messages.pageSubtitle}</p>
      </header>

      <JobsFilters
        categories={categories}
        locale={locale}
        messages={messages}
      />

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {messages.noJobsTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isAREmpty ? messages.noJobsTranslating : messages.noJobsBody}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Link href={switcherHref} className="font-medium text-blue-700 hover:text-blue-900" hrefLang={otherLocale}>
              {switcherLabel}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              {locale === "ar" ? "العودة للرئيسية" : "Back to home"}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                locale={locale}
                messages={messages}
              />
            ))}
          </ul>

          <Pagination
            currentPage={pagination.page}
            pageCount={pagination.pageCount}
            basePath="/jobs"
            extraParams={paginationExtra}
          />

          <JsonLd
            graph={[
              buildItemList(
                jobs.map((j) => ({
                  url: `${SITE_URL}/jobs/${j.slug}${
                    locale !== "en" ? `?lang=${locale}` : ""
                  }`,
                })),
                (page - 1) * pagination.pageSize + 1,
              ),
            ]}
          />
        </>
      )}
    </main>
  );
}
