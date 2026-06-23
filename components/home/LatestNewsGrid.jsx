'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  getCategoryColor,
  getFeaturedImageAlt,
  getFeaturedImageUrl,
} from '@/lib/utils'

function shufflePosts(posts) {
  const shuffled = [...posts]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function LatestNewsGrid({ posts, limit = 6 }) {
  const [visiblePosts, setVisiblePosts] = useState(() =>
    (posts || []).slice(0, limit)
  )

  useEffect(() => {
    if (!posts?.length) return
    setVisiblePosts(shufflePosts(posts).slice(0, limit))
  }, [posts, limit])

  if (!posts?.length) return null

  return (
    <section id="latest-news" className="my-8">
      <h2 className="mb-5 inline-block border-b-2 border-accent pb-2 font-heading text-xl font-bold text-text-primary">
        Latest News
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => {
          const img = getFeaturedImageUrl(post, 'medium_large')
          const category = post._embedded?.['wp:term']?.[0]?.[0] || null
          const categorySlug = category?.slug || 'uncategorized'

          return (
            <Link
              key={post.id}
              href={`/${categorySlug}/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                {img ? (
                  <Image
                    src={img}
                    alt={getFeaturedImageAlt(post)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 273px"
                    quality={60}
                  />
                ) : (
                  <div
                    className={`h-full w-full ${getCategoryColor(category?.slug || 'default')}`}
                  />
                )}
                {category && (
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${getCategoryColor(category.slug)}`}
                  >
                    {category.name}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3
                  className="line-clamp-2 font-heading text-sm font-bold leading-snug text-text-primary transition-colors group-hover:text-accent"
                  dangerouslySetInnerHTML={{ __html: post.title?.rendered }}
                />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/blog"
          className="inline-block rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Explore Today Latest News &amp; Blog - Click Here
        </Link>
      </div>
    </section>
  )
}
