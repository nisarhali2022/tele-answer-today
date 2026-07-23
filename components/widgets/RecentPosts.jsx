import Link from 'next/link';
import Image from 'next/image';
import {
  getFeaturedImageAlt,
  getFeaturedImageUrl,
  getFirstCategory,
} from '@/lib/utils';

export default function RecentPosts({ posts = [], limit = 5 }) {
  if (!posts || posts.length === 0) return null;
  const visiblePosts = posts.slice(0, limit);

  return (
    <ul className="space-y-3">
      {visiblePosts.map((post) => {
        const imageUrl = getFeaturedImageUrl(post, 'thumbnail');
        const categorySlug = getFirstCategory(post)?.slug || 'uncategorized';
        return (
          <li key={post.id}>
            <Link
              href={`/${categorySlug}/${post.slug}`}
              className="flex gap-3 group"
            >
              <div className="relative w-16 h-14 flex-shrink-0 rounded overflow-hidden bg-surface">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={getFeaturedImageAlt(post)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
