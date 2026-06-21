import Link from 'next/link';
import { getFirstCategory } from '@/lib/utils';

export default function PopularPosts({ posts = [] }) {
  if (posts.length === 0) return null;

  return (
    <ul className="space-y-3">
      {posts.map((post, index) => {
        const categorySlug = getFirstCategory(post)?.slug || 'uncategorized';
        return (
          <li key={post.id}>
            <Link href={`/${categorySlug}/${post.slug}`} className="flex gap-3 group">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-1">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug"
                  dangerouslySetInnerHTML={{ __html: post.title?.rendered }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
