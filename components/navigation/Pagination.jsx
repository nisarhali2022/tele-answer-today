import Link from 'next/link';

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  query = {},
}) {
  if (!totalPages || totalPages <= 1) return null;

  const getPageUrl = (page) => {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        params.set(key, String(value));
      }
    });

    if (page > 1) params.set('page', String(page));

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // Build page number array (max 5 around current)
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 rounded border border-border text-text-secondary hover:bg-surface hover:text-primary transition-colors text-sm"
        >
          ← Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-primary text-white border-primary'
              : 'border-border text-text-secondary hover:bg-surface hover:text-primary'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 rounded border border-border text-text-secondary hover:bg-surface hover:text-primary transition-colors text-sm"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
