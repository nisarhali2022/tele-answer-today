export default function TableOfContents({ toc, defaultExpanded = false }) {
  if (!toc || toc.length === 0) return null;

  return (
    <details
      className="group mb-8 rounded-lg bg-[#f8fafc] p-6"
      open={defaultExpanded}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden"
      >
        <div className="font-heading font-bold text-lg text-navy-dark m-0">
          Table of Contents
        </div>
        <svg
          className="h-5 w-5 rotate-180 transform text-navy-dark transition-transform duration-200 group-open:rotate-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </summary>

      <nav className="mt-5">
        <ul className="list-none space-y-2.5 m-0 p-0">
          {toc.map((item, index) => {
            // Calculate left margin based on heading level
            let mlClass = 'ml-4';
            if (item.level === 2) mlClass = 'ml-8';
            if (item.level === 3) mlClass = 'ml-12';
            if (item.level === 4) mlClass = 'ml-16';
            if (item.level > 4) mlClass = 'ml-20';

            return (
              <li
                key={`${item.id}-${index}`}
                className={`${mlClass} list-disc text-slate-700 marker:text-slate-700`}
              >
                <a
                  href={`#${item.id}`}
                  className="underline decoration-slate-400 decoration-1 underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors text-[15px]"
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </details>
  );
}
