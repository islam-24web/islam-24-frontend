import Link from "next/link";

type SalaryUnit = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
type JobLocationType = "TELECOMMUTE" | "ONSITE" | "HYBRID";

interface PhysicalLocation {
  country: string;
  region?: string | null;
  city?: string | null;
}

interface Company {
  name: string;
  slug: string;
}

interface JobCategory {
  name: string;
  slug: string;
}

interface Job {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  descriptionShort?: string | null;
  applyUrl: string;
  jobLocationType?: JobLocationType | null;
  physicalLocation?: PhysicalLocation | null;
  salaryMin?: string | number | null;
  salaryMax?: string | number | null;
  salaryCurrency?: string | null;
  salaryUnit?: SalaryUnit | null;
  company?: Company | null;
  jobCategory?: JobCategory | null;
}

interface JobsResponse {
  data: Job[];
}

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

async function fetchJobs(): Promise<Job[]> {
  const url =
    `${STRAPI_URL.replace(/\/$/, "")}/api/jobs` +
    `?populate[company][populate]=*` +
    `&populate[jobCategory][populate]=*` +
    `&sort[0]=createdAt:desc`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Strapi GET /api/jobs → ${res.status}`);
  }
  const json = (await res.json()) as JobsResponse;
  return json.data ?? [];
}

function formatSalary(job: Job): string | null {
  const toNum = (v: string | number | null | undefined) => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const min = toNum(job.salaryMin);
  const max = toNum(job.salaryMax);
  if (min == null && max == null) return null;

  const currency = job.salaryCurrency || "USD";
  const unit = (job.salaryUnit || "YEAR").toLowerCase();
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  if (min != null && max != null && min !== max) {
    return `${fmt(min)} – ${fmt(max)} / ${unit}`;
  }
  return `${fmt((min ?? max) as number)} / ${unit}`;
}

function formatLocation(job: Job): string {
  if (job.jobLocationType === "TELECOMMUTE") return "Remote";
  const loc = job.physicalLocation;
  if (loc) {
    const parts = [loc.city, loc.region, loc.country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return "Remote";
}

export default async function JobsPage() {
  const jobs = await fetchJobs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Jobs
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Halal-filtered remote jobs, refreshed from RemoteOK.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            No jobs yet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Once the sync worker runs against this Strapi instance, jobs will
            appear here.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const salary = formatSalary(job);
            const location = formatLocation(job);
            return (
              <li
                key={job.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
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
                  {job.company?.name ?? "Unknown company"}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{location}</div>

                {job.descriptionShort ? (
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                    {job.descriptionShort}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-gray-800">
                    {salary ?? "—"}
                  </span>
                  <Link
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Apply
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
