import ResponsiveCmsImage from './ResponsiveCmsImage'
import { getFeaturedImageUrl, getCategoryColor, getFirstCategory } from '@/lib/utils'

export default function FeaturedImage({
  post,
  priority = false,
  fill = false,
  mode = 'article',
  className = '',
}) {
  const src = getFeaturedImageUrl(post)
  const category = getFirstCategory(post)
  const fallbackColor = getCategoryColor(category?.slug || 'default')

  if (!src) {
    return (
      <div className={`${fallbackColor} flex items-center justify-center w-full h-full min-h-[200px] ${className}`}>
        <span className="text-white font-heading font-bold text-base px-4 text-center opacity-90">
          Telenor Quiz Today
        </span>
      </div>
    )
  }

  if (fill) {
    return <ResponsiveCmsImage post={post} mode={mode} priority={priority} fill className={className} />
  }

  return <ResponsiveCmsImage post={post} mode={mode} priority={priority} className={className} />
}
