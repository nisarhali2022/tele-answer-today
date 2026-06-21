'use client';

import { useState } from 'react';

export default function TableOfContents({ toc, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!toc || toc.length === 0) return null;

  return (
    <div className="bg-[#f8fafc] rounded-lg p-6 mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-heading font-bold text-lg text-[#152b47] m-0">Table of Contents</h3>
        <button 
          className="text-[#152b47] hover:text-primary transition-colors focus:outline-none"
          aria-label={isExpanded ? 'Collapse Table of Contents' : 'Expand Table of Contents'}
        >
          <svg 
            className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <nav className="mt-5">
          <ul className="list-none space-y-2.5 m-0 p-0">
            {toc.map((item, index) => {
              // Calculate left margin based on heading level
              let mlClass = 'ml-5'; // Default for h1
              if (item.level === 2) mlClass = 'ml-10';
              if (item.level === 3) mlClass = 'ml-16';
              if (item.level === 4) mlClass = 'ml-20';
              if (item.level > 4) mlClass = 'ml-24';

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
      )}
    </div>
  );
}
