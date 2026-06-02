import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  buildJobUrl,
  buildLocalJobHref,
  buildVerifiedRemoteUrl,
  fetchJobCategories,
  fetchJobs,
} from "@/lib/jobs/api";
import { getDir, getMessages, parseLocale } from "@/lib/jobs/i18n";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildItemList } from "@/lib/seo/schema/item-list";
import JobsFilters from "@/components/jobs/JobsFilters";
import JobCard from "@/components/jobs/JobCard";
import VerifiedRemoteShell from "@/components/jobs/VerifiedRemoteShell";
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

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const locale = parseLocale(searchParams.lang);
  const messages = getMessages(locale);
  const canonical = buildVerifiedRemoteUrl(locale);
  const ogImage = `${buildVerifiedRemoteUrl("ar")}/verified-remote/verified-remote-header-1900x300.png`;

  return {
    title: {
      absolute:
        locale === "ar"
          ? "Verified Remote | فرص عمل عن بُعد مختارة"
          : "Verified Remote | Curated Remote Opportunities",
    },
    description: messages.pageSubtitle,
    alternates: {
      canonical,
      languages: {
        ar: buildVerifiedRemoteUrl("ar"),
        en: buildVerifiedRemoteUrl("en"),
        "x-default": buildVerifiedRemoteUrl("ar"),
      },
    },
    openGraph: {
      title: "Verified Remote",
      description: messages.pageSubtitle,
      url: canonical,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1900,
          height: 300,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Verified Remote",
      description: messages.pageSubtitle,
      images: [ogImage],
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
  if (locale === "en") paginationExtra.set("lang", locale);
  if (categorySlug) paginationExtra.set("category", categorySlug);
  if (search) paginationExtra.set("q", search);
  if (remoteOnly) paginationExtra.set("remote", "1");

  return (
    <VerifiedRemoteShell locale={locale} messages={messages}>
      <main dir={dir} lang={locale}>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-6">
            <Image
              src="/verified-remote/verified-remote-header-1900x300.png"
              alt=""
              width={1900}
              height={300}
              priority
              className="h-auto max-h-[220px] w-full rounded-lg border border-slate-200 object-cover"
            />
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div>
              <p className="text-sm font-semibold text-teal-700">
                {messages.heroKicker}
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {messages.heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                {messages.heroBody}
              </p>
              <div className="mt-6">
                <Link
                  href="#latest"
                  className="inline-flex items-center rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {messages.browseOpportunities}
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-950">
                {messages.trustPanelTitle}
              </div>
              <div className="mt-4 h-1.5 w-24 rounded-full bg-teal-500" />
              <dl className="mt-5 grid gap-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <dt className="text-slate-600">{messages.sourceUrl}</dt>
                  <dd className="font-medium text-slate-950">
                    {messages.trustSourceLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <dt className="text-slate-600">{messages.sourceReviewedAt}</dt>
                  <dd className="font-medium text-slate-950">
                    {messages.trustManualLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">{messages.jobDetails}</dt>
                  <dd className="font-medium text-slate-950">
                    {messages.trustDetailsLabel}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="review" className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {messages.howWeReviewTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {messages.howWeReviewBody}
              </p>
            </div>
            <div id="referrals">
              <h2 className="text-lg font-semibold text-slate-950">
                {messages.referralDisclosureTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {messages.referralNotice}
              </p>
            </div>
          </div>
        </section>

        <section id="latest" className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                {messages.latestTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {messages.latestSubtitle}
              </p>
            </div>
          </div>

          <JobsFilters
            categories={categories}
            locale={locale}
            messages={messages}
          />

          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                {messages.noJobsTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {messages.noJobsBody}
              </p>
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
                      url: buildJobUrl(j, locale),
                    })),
                    (page - 1) * pagination.pageSize + 1,
                  ),
                ]}
              />
            </>
          )}
        </section>
      </main>
    </VerifiedRemoteShell>
  );
}
