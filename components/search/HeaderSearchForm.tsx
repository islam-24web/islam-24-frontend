interface HeaderSearchFormProps {
  className?: string;
  id?: string;
}

export default function HeaderSearchForm({
  className = "",
  id = "site-search",
}: HeaderSearchFormProps) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={`relative flex min-w-0 items-center ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        بحث في إسلام 24
      </label>
      <input
        id={id}
        name="q"
        type="search"
        dir="rtl"
        placeholder="ابحث في الموقع"
        className="h-9 w-full rounded-md border border-emerald-600 bg-emerald-900/35 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-emerald-200 outline-none transition focus:border-amber-400 focus:bg-emerald-900/60 focus:ring-2 focus:ring-amber-400/30"
      />
      <button
        type="submit"
        aria-label="بحث"
        className="absolute left-1.5 inline-flex h-6 w-6 items-center justify-center rounded text-emerald-100 transition hover:bg-emerald-700 hover:text-amber-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.1-5.15a6.25 6.25 0 1 1-12.5 0 6.25 6.25 0 0 1 12.5 0Z" />
        </svg>
      </button>
    </form>
  );
}
