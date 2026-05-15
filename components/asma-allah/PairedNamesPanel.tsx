import Link from "next/link";
import type { DivineNameRef } from "@/types/strapi";

interface Group {
  label: string;
  names: DivineNameRef[];
}

interface Props {
  groups: Group[];
}

export default function PairedNamesPanel({ groups }: Props) {
  const visible = groups.filter((g) => g.names.length > 0);
  if (visible.length === 0) return null;

  return (
    <aside
      className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
      aria-label="الأسماء المقترنة"
      dir="rtl"
    >
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        الأسماء المقترنة
      </h2>
      <dl className="space-y-4">
        {visible.map((g) => (
          <div key={g.label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              {g.label}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {g.names.map((n) => (
                <Link
                  key={n.id}
                  href={`/asma-allah/${n.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1 text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="font-mono text-[10px] text-gray-400">
                    {n.number}
                  </span>
                  <span className="font-semibold text-gray-900">{n.arabic}</span>
                </Link>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
