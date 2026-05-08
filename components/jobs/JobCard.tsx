import Link from "next/link";
import type { Job, Locale } from "@/lib/jobs/api";
import { formatSalaryRange, type Messages } from "@/lib/jobs/i18n";

interface Props {
  job: Job;
  locale: Locale;
  messages: Messages;
}

function formatLocation(job: Job, messages: Messages): string {
  if (job.jobLocationType === "TELECOMMUTE") return messages.remote;
  const loc = job.physicalLocation;
  if (loc) {
    const parts = [loc.city, loc.region, loc.country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return messages.remote;
}

export default function JobCard({ job, locale, messages }: Props) {
  const salary = formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryUnit,
    locale,
  );
  const location = formatLocation(job, messages);
  const detailHref =
    locale === "en" ? `/jobs/${job.slug}` : `/jobs/${job.slug}?lang=${locale}`;

  return (
    <li className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={detailHref} className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-gray-900">
            {job.title}
          </h2>
          {job.jobCategory?.name ? (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {job.jobCategory.name}
            </span>
          ) : null}
        </div>

        <div className="mt-2 text-sm text-gray-700">
          {job.company?.name ?? messages.hiringOrganization}
        </div>
        <div className="mt-0.5 text-xs text-gray-500">{location}</div>

        {job.descriptionShort ? (
          <p className="mt-3 line-clamp-3 text-sm text-gray-600">
            {job.descriptionShort}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-medium text-gray-800">
            {salary ?? messages.salaryNotSpecified}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
            {messages.apply}
          </span>
        </div>
      </Link>
    </li>
  );
}
