'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  getCategoryColor,
  getFeaturedImageAlt,
  getFeaturedImageUrl,
} from '@/lib/utils';

function shufflePosts(posts) {
  const shuffled = [...posts];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function LatestNewsGrid({ posts, limit = 6 }) {
  const [visiblePosts, setVisiblePosts] = useState(() =>
    (posts || []).slice(0, limit)
  );

  useEffect(() => {
    if (!posts?.length) return;
    setVisiblePosts(shufflePosts(posts).slice(0, limit));
  }, [posts, limit]);

  if (!posts?.length) return null;

  return (
    <section id="latest-news" className="my-8">
      <h2 className="font-heading font-bold text-xl text-text-primary mb-5 pb-2 border-b-2 border-accent inline-block">
        Latest News
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visiblePosts.map((post) => {
          const img = getFeaturedImageUrl(post, 'medium_large');
          const category = post._embedded?.['wp:term']?.[0]?.[0] || null;
          const categorySlug = category?.slug || 'uncategorized';
          return (
            <Link
              key={post.id}
              href={`/${categorySlug}/${post.slug}`}
              className="group flex flex-col bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative w-full aspect-video overflow-hidden bg-surface">
                {img ? (
                  <Image
                    src={img}
                    alt={getFeaturedImageAlt(post)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 273px"
                    quality={60}
                  />
                ) : (
                  <div className={`w-full h-full ${getCategoryColor(category?.slug || 'default')}`} />
                )}
                {category && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-semibold ${getCategoryColor(category.slug)}`}>
                    {category.name}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3
                  className="font-heading font-bold text-sm text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors"
                  dangerouslySetInnerHTML={{ __html: post.title?.rendered }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/blog"
          className="inline-block px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded hover:bg-[#2a5298] transition-colors"
        >
          👉 Explore Today Top News &amp; Blog – Click Here
        </Link>
      </div>
    </section>
  );
}
