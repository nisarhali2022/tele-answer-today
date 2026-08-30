import Link from 'next/link'
import { homeAnchorId } from '@/lib/homeAnchors'
import ResponsiveCmsImage from '@/components/posts/ResponsiveCmsImage'
import {
  getCategoryColor,
  getFeaturedImageUrl,
} from '@/lib/utils'

export default function LatestNewsGrid({ posts, limit = 6 }) {
  if (!posts?.length) return null
  const visiblePosts = posts.slice(0, limit)

  return (
    <section id={homeAnchorId('Latest News')} className="my-8">
      <h2 className="mb-5 inline-block border-b-2 border-accent pb-2 font-heading text-xl font-bold text-text-primary">
        Latest News
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => {
          const img = getFeaturedImageUrl(post, 'medium_large')
          const category = post.category || null
          const categorySlug = category?.slug || 'uncategorized'

          return (
            <Link
              key={post.id}
              href={`/${categorySlug}/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                {img ? (
                  <ResponsiveCmsImage
                    post={post}
                    mode="card"
                    fill
                    className="transition-transform duration-300 group-hover:scale-105"
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
                  dangerouslySetInnerHTML={{ __html: post.title }}
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
