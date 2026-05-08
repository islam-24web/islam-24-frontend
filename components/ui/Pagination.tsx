import Link from "next/link";

interface Props {
  currentPage: number;
  pageCount: number;
  basePath: string;
  extraParams?: URLSearchParams;
}

export default function Pagination({
  currentPage,
  pageCount,
  basePath,
  extraParams,
}: Props) {
  if (pageCount <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (extraParams) {
      extraParams.forEach((v, k) => {
        if (k !== "page") params.set(k, v);
      });
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  // Show max 7 page buttons with ellipsis
  const getVisiblePages = () => {
    if (pageCount <= 7) return pages;

    if (currentPage <= 4) return [...pages.slice(0, 5), -1, pageCount];
    if (currentPage >= pageCount - 3) return [1, -1, ...pages.slice(pageCount - 5)];
    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -2, pageCount];
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Prev
        </Link>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page, idx) => {
        if (page < 0) {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(page)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </Link>
        );
      })}

      {/* Next */}
      {currentPage < pageCount && (
        <Link
          href={buildHref(currentPage + 1)}
          className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          Next
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}
    </nav>
  );
}
