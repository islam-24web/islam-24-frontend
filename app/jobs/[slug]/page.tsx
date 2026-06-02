import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  buildJobUrl,
  buildVerifiedRemoteUrl,
  fetchJobBySlug,
  getJobApplicationUrl,
  isPublicVerifiedJob,
  type Job,
  type Locale,
} from "@/lib/jobs/api";
import {
  formatDate,
  formatSalaryRange,
  getDir,
  getMessages,
  parseLocale,
  type Messages,
} from "@/lib/jobs/i18n";
import { JsonLd } from "@/lib/seo/schema/core";
import { buildBreadcrumb } from "@/lib/seo/schema/breadcrumb";
import { buildJobPosting } from "@/lib/seo/schema/job-posting";
import VerifiedRemoteShell from "@/components/jobs/VerifiedRemoteShell";

interface Props {
  params: { slug: string };
  searchParams: { lang?: string };
}

async function getJobDetailData(slug: string, requestedLocale: Locale) {
  const job = await fetchJobBySlug(slug, requestedLocale);
  return {
    job,
    hasRequestedLocale: Boolean(job),
  };
}

function buildJobAlternates(slug: string) {
  return {
    ar: buildJobUrl({ slug }, "ar"),
    en: buildJobUrl({ slug }, "en"),
    "x-default": buildJobUrl({ slug }, "ar"),
  };
}

function seoTitle(job: Job, locale: Locale): string {
  if (job.seoTitle || job.metaTitle) return (job.seoTitle || job.metaTitle) as string;
  const company = job.company?.name ? ` - ${job.company.name}` : "";
  return locale === "ar"
    ? `${job.title}${company} | Verified Remote`
    : `${job.title}${company} | Verified Remote`;
}

function seoDescription(job: Job, messages: Messages): string {
  return (
    job.seoDescription ||
    job.metaDescription ||
    job.summary ||
    job.descriptionShort ||
    messages.pageSubtitle
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const locale = parseLocale(searchParams.lang);
  const messages = getMessages(locale);
  const { job, hasRequestedLocale } = await getJobDetailData(
    params.slug,
    locale,
  );
  if (!job || !isPublicVerifiedJob(job)) {
    return { title: "Not found", robots: { index: false, follow: true } };
  }

  const canonical = buildJobUrl(job, locale);
  const description = seoDescription(job, messages);
  const ogImage = `${buildVerifiedRemoteUrl("ar")}/verified-remote/verified-remote-header-1900x300.png`;

  return {
    title: { absolute: seoTitle(job, locale) },
    description,
    alternates: {
      canonical,
      languages: buildJobAlternates(job.slug),
    },
    openGraph: {
      type: "article",
      title: seoTitle(job, locale),
      description,
      url: canonical,
      siteName: "Verified Remote",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: [{ url: ogImage, width: 1900, height: 300 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle(job, locale),
      description,
      images: [ogImage],
    },
    robots: { index: hasRequestedLocale, follow: true },
  };
}

function formatLocationLabel(job: Job, messages: Messages): string {
  if (job.remoteType) return job.remoteType;
  if (job.jobLocationType === "TELECOMMUTE") return messages.remote;
  const loc = job.physicalLocation;
  if (loc) {
    const parts = [loc.city, loc.region, loc.country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return messages.remote;
}

function textLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

function DetailSection({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  if (!value?.trim()) return null;
  const lines = textLines(value);
  const isList = lines.length > 1;

  return (
    <section className="border-t border-slate-200 pt-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {isList ? (
        <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6 text-slate-700">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-700">{value}</p>
      )}
    </section>
  );
}

export default async function JobDetailPage({ params, searchParams }: Props) {
  const locale = parseLocale(searchParams.lang);
  const messages = getMessages(locale);
  const dir = getDir(locale);

  const { job } = await getJobDetailData(params.slug, locale);
  if (!job || !isPublicVerifiedJob(job)) notFound();

  const canonical = buildJobUrl(job, locale);
  const applicationUrl = getJobApplicationUrl(job);
  const salary =
    job.payText ||
    formatSalaryRange(
      job.salaryMin,
      job.salaryMax,
      job.salaryCurrency,
      job.salaryUnit,
      locale,
    );
  const location = formatLocationLabel(job, messages);

  const breadcrumbs = [
    { name: "Verified Remote", url: buildVerifiedRemoteUrl(locale) },
    {
      name: messages.latestTitle,
      url: buildVerifiedRemoteUrl(locale),
    },
    { name: job.title, url: canonical },
  ];

  return (
    <VerifiedRemoteShell locale={locale} messages={messages}>
      <main className="mx-auto max-w-4xl px-4 py-10" dir={dir} lang={locale}>
        <Link
          href={locale === "en" ? "/en" : "/jobs"}
          className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
        >
          {messages.backToList}
        </Link>

        <article className="mt-6">
          <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {job.category || job.jobCategory?.name ? (
              <span className="inline-flex rounded border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                {job.category || job.jobCategory?.name}
              </span>
            ) : null}

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {job.title}
            </h1>

            {locale === "ar" && job.originalTitle ? (
              <div className="mt-1 text-sm text-slate-500" dir="ltr">
                {messages.originalTitle}: {job.originalTitle}
              </div>
            ) : null}

            <div className="mt-2 text-sm text-slate-700">
              {job.company?.name ?? messages.hiringOrganization}
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">{messages.remoteType}</dt>
                <dd className="font-medium text-slate-900">{location}</dd>
              </div>
              {job.contractType ? (
                <div>
                  <dt className="text-slate-500">{messages.contractType}</dt>
                  <dd className="font-medium text-slate-900">
                    {job.contractType}
                  </dd>
                </div>
              ) : null}
              {salary ? (
                <div>
                  <dt className="text-slate-500">{messages.payText}</dt>
                  <dd className="font-medium text-slate-900">{salary}</dd>
                </div>
              ) : null}
              {job.locationEligibility ? (
                <div>
                  <dt className="text-slate-500">
                    {messages.locationEligibility}
                  </dt>
                  <dd className="font-medium text-slate-900">
                    {job.locationEligibility}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-slate-500">{messages.sourceReviewedAt}</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(job.sourceReviewedAt, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{messages.status}</dt>
                <dd className="font-medium capitalize text-slate-900">
                  {job.status.replace("_", " ")}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={applicationUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {messages.apply}
              </a>
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                {messages.sourceUrl}
              </a>
            </div>
          </header>

          <div className="mt-8 space-y-6">
            <DetailSection
              title={messages.summary}
              value={job.summary || job.descriptionShort || job.description}
            />
            <DetailSection
              title={messages.responsibilities}
              value={job.responsibilities}
            />
            <DetailSection
              title={messages.requirements}
              value={job.requirements}
            />
            <DetailSection
              title={messages.contractDetails}
              value={job.contractDetails}
            />

            {job.isReferral ? (
              <section className="rounded-lg border border-teal-200 bg-teal-50 p-5">
                <h2 className="text-base font-semibold text-teal-950">
                  {messages.referralDisclosureTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-teal-900">
                  {messages.referralDisclosure}
                </p>
              </section>
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-base font-semibold text-slate-950">
                {messages.safetyNoteTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {messages.safetyNote}
              </p>
            </section>
          </div>
        </article>

        <JsonLd
          graph={[
            buildJobPosting({
              job,
              canonicalUrl: canonical,
              locale,
            }),
            buildBreadcrumb(breadcrumbs),
          ]}
        />
      </main>
    </VerifiedRemoteShell>
  );
}
