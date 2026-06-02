"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { JobCategory, Locale } from "@/lib/jobs/api";
import type { Messages } from "@/lib/jobs/i18n";

interface Props {
  categories: JobCategory[];
  locale: Locale;
  messages: Messages;
}

export default function JobsFilters({ categories, locale, messages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentSearch = searchParams.get("q") ?? "";
  const remoteOnly = searchParams.get("remote") === "1";

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (searchInput === currentSearch) return;
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set("q", searchInput);
      else params.delete("q");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, currentSearch, pathname, router, searchParams]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams();
    if (locale === "en") params.set("lang", locale);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const hasActiveFilters = !!(currentCategory || currentSearch || remoteOnly);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <select
        value={currentCategory}
        onChange={(e) => updateParam("category", e.target.value || null)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        aria-label={messages.filterCategory}
      >
        <option value="">{messages.filterCategoryAll}</option>
        {categories.map((cat) => (
          <option key={cat.documentId} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder={messages.filterSearch}
        className="grow min-w-[200px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        aria-label={messages.filterSearch}
      />

      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
        <input
          type="checkbox"
          checked={remoteOnly}
          onChange={(e) => updateParam("remote", e.target.checked ? "1" : null)}
          className="h-4 w-4"
        />
        {messages.filterRemoteOnly}
      </label>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={clearAll}
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          {messages.filterClear}
        </button>
      ) : null}

      <div className="ms-auto flex items-center gap-1 rounded-md bg-slate-100 p-1">
        <Link
          href="/en"
          hrefLang="en"
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === "en"
              ? "bg-white text-slate-950 shadow"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          {messages.localeEnglish}
        </Link>
        <Link
          href="/jobs"
          hrefLang="ar"
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === "ar"
              ? "bg-white text-slate-950 shadow"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          {messages.localeArabic}
        </Link>
      </div>
    </div>
  );
}
