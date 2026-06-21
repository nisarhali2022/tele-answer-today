import Link from 'next/link'
import FeaturedImage from './FeaturedImage'
import PostMeta from './PostMeta'
import { getExcerpt, getFirstCategory } from '@/lib/utils'

export default function PostCard({
  post,
  priority = false,
  showDate = true,
  size = 'default',
}) {
  const isLarge = size === 'large'
  const categorySlug = getFirstCategory(post)?.slug || 'uncategorized'

  return (
    <article className="card group h-full flex flex-col">
      {/* Image */}
      <Link href={`/${categorySlug}/${post.slug}`} className="block overflow-hidden flex-shrink-0">
        <div className={`relative w-full overflow-hidden ${isLarge ? 'aspect-[16/7]' : 'aspect-[16/9]'}`}>
          <FeaturedImage
            post={post}
            priority={priority}
            fill
            className="group-hover:scale-105 transition-transform duration-300"
            sizes={
              isLarge
                ? '(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 800px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 273px'
            }
            quality={60}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <PostMeta
          post={post}
          showAuthor={false}
          showDate={showDate}
          size="small"
        />

        <Link href={`/${categorySlug}/${post.slug}`} className="block flex-1">
          <h2
            className={`font-heading font-bold text-text-primary group-hover:text-primary transition-colors leading-snug line-clamp-3 ${
              isLarge ? 'text-xl' : 'text-base'
            }`}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>

        {!isLarge && (
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {getExcerpt(post, 110)}
          </p>
        )}

        <Link
          href={`/${categorySlug}/${post.slug}`}
          className="text-primary hover:text-primary-dark text-sm font-semibold flex items-center gap-1 mt-auto transition-colors"
        >
          Read More
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
