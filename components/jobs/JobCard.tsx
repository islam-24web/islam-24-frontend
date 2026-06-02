import Link from "next/link";
import { buildLocalJobHref } from "@/lib/jobs/api";
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
  const salary = job.payText || formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryUnit,
    locale,
  );
  const location = formatLocation(job, messages);
  const detailHref = buildLocalJobHref(job, locale);
  const category = job.category || job.jobCategory?.name;
  const summary = job.summary || job.descriptionShort;

  return (
    <li className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-teal-300 hover:shadow-md">
      <Link href={detailHref} className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-slate-950">
            {job.title}
          </h2>
          {category ? (
            <span className="shrink-0 rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
              {category}
            </span>
          ) : null}
        </div>

        <div className="mt-2 text-sm text-slate-700">
          {job.company?.name ?? messages.hiringOrganization}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          {job.remoteType || location}
        </div>

        {summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {summary}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-medium text-slate-800">
            {salary ?? messages.salaryNotSpecified}
          </span>
          <span className="inline-flex items-center rounded-md bg-slate-950 px-3 py-1.5 text-sm font-medium text-white">
            {messages.apply}
          </span>
        </div>
      </Link>
    </li>
  );
}
