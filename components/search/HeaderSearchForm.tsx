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
      className={`relative flex w-full min-w-0 items-center ${className}`}
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
        className="site-search-input h-10 w-full rounded-lg border py-1.5 pl-10 pr-3 text-sm font-semibold outline-none transition"
      />
      <button
        type="submit"
        aria-label="بحث"
        className="site-search-button absolute left-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md transition"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.1-5.15a6.25 6.25 0 1 1-12.5 0 6.25 6.25 0 0 1 12.5 0Z" />
        </svg>
      </button>
    </form>
  );
}
