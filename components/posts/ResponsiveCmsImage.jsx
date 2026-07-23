/* eslint-disable @next/next/no-img-element */
import {
  getFeaturedImageAlt,
  getFeaturedImageDimensions,
  getFeaturedImageUrl,
} from '@/lib/utils'

export default function ResponsiveCmsImage({
  post,
  mode = 'article',
  priority = false,
  fill = false,
  className = '',
}) {
  const preferredSize = mode === 'thumbnail' ? 'thumbnail' : mode === 'card' ? 'card' : 'large'
  const src = getFeaturedImageUrl(post, preferredSize)
  const mobileSrc = mode === 'article' ? getFeaturedImageUrl(post, 'mobile') : null
  const dimensions = getFeaturedImageDimensions(post, preferredSize)

  if (!src) return null

  return (
    <picture className={fill ? 'absolute inset-0 block' : 'block'}>
      {mobileSrc && mobileSrc !== src ? (
        <source media="(max-width: 640px)" srcSet={mobileSrc} />
      ) : null}
      <img
        src={src}
        alt={getFeaturedImageAlt(post)}
        width={fill ? undefined : dimensions.width}
        height={fill ? undefined : dimensions.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={fill ? `h-full w-full object-cover ${className}` : `h-auto w-full object-cover ${className}`}
      />
    </picture>
  )
}
