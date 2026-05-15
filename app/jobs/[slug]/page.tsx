import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  buildJobUrl,
  fetchJobBySlug,
  type Job,
} from "@/lib/jobs/api";
import {
  formatDate,
  formatSalaryRange,
  getDir,
  getMessages,
  parseLocale,
  t,
  type Messages,
} from "@/lib/jobs/i18n";
import { getSiteUrl, SITE_NAME_AR } from "@/lib/seo/site";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";
import { buildJobPosting } from "@/lib/seo/schema/job-posting";

interface Props {
  params: { slug: string };
  searchParams: { lang?: string };
}

const SITE_URL = getSiteUrl();

const BRAND_NAME = SITE_NAME_AR;
const SOURCE_NAME = "RemoteOK";

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const locale = parseLocale(searchParams.lang);
  const job = await fetchJobBySlug(params.slug, locale);
  if (!job) return { title: "Not found" };

  const canonical = buildJobUrl(job, locale);
  const description = job.metaDescription || job.descriptionShort || undefined;
  const enUrl = buildJobUrl(job, "en");
  const arUrl = buildJobUrl(job, "ar");

  return {
    title: job.title,
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        ar: arUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      type: "article",
      title: job.title,
      description,
      url: canonical,
      siteName: BRAND_NAME,
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
    twitter: { card: "summary", title: job.title, description },
    robots: { index: true, follow: true },
  };
}

function formatLocationLabel(job: Job, messages: Messages): string {
  if (job.jobLocationType === "TELECOMMUTE") return messages.remote;
  const loc = job.physicalLocation;
  if (loc) {
    const parts = [loc.city, loc.region, loc.country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return messages.remote;
}

export default async function JobDetailPage({ params, searchParams }: Props) {
  const locale = parseLocale(searchParams.lang);
  const messages = getMessages(locale);
  const dir = getDir(locale);

  const job = await fetchJobBySlug(params.slug, locale);
  if (!job) notFound();

  const canonical = buildJobUrl(job, locale);
  const salary = formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryUnit,
    locale,
  );
  const location = formatLocationLabel(job, messages);
  const applyText = t(messages.applyAt, { source: SOURCE_NAME });
  const descriptionDir = locale === "ar" ? "rtl" : "ltr";

  const breadcrumbs = [
    { name: BRAND_NAME, url: SITE_URL },
    {
      name: messages.pageTitle,
      url: `${SITE_URL}/jobs${locale !== "en" ? "?lang=ar" : ""}`,
    },
    { name: job.title, url: canonical },
  ];

  const employmentLabel = job.employmentType.replace("_", " ").toLowerCase();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" dir={dir} lang={locale}>
      <Link
        href={locale === "en" ? "/jobs" : `/jobs?lang=${locale}`}
        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        {messages.backToList}
      </Link>

      <article className="mt-6">
        <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {job.jobCategory?.name ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {job.jobCategory.name}
            </span>
          ) : null}

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {job.title}
          </h1>

          <div className="mt-1 text-sm text-gray-700">
            {job.company?.name ?? messages.hiringOrganization}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{location}</span>
            <span aria-hidden>·</span>
            <span className="capitalize">{employmentLabel}</span>
            <span aria-hidden>·</span>
            <span>
              {t(messages.postedOn, { date: formatDate(job.datePosted, locale) })}
            </span>
            <span aria-hidden>·</span>
            <span>
              {t(messages.validUntil, {
                date: formatDate(job.validThrough, locale),
              })}
            </span>
          </div>

          {salary ? (
            <div className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900">
              {salary}
            </div>
          ) : null}

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {applyText}
          </a>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            {messages.fullDescription}
          </h2>
          <div
            dir={descriptionDir}
            className="prose prose-sm mt-4 max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </section>

        <div className="mt-8">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {applyText}
          </a>
        </div>
      </article>

      <JsonLd
        graph={[
          buildJobPosting({ job, canonicalUrl: canonical, locale }),
          buildBreadcrumb(breadcrumbs),
        ]}
      />
    </main>
  );
}
