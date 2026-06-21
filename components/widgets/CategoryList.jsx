import Link from 'next/link';
import { getCategoryColor } from '@/lib/utils';

export default function CategoryList({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <ul className="space-y-1">
      {categories.map((cat) => {
        const colorClass = getCategoryColor(cat.slug);
        return (
          <li key={cat.id}>
            <Link
              href={`/${cat.slug}`}
              className={`flex items-center justify-between px-3 py-2 rounded hover:bg-surface transition-colors group border-l-4 ${colorClass.replace('bg-', 'border-')}`}
            >
              <span className="text-sm text-text-primary group-hover:text-accent transition-colors font-medium">
                {cat.name}
              </span>
              <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full">
                {cat.count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
