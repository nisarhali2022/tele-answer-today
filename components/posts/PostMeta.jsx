import Link from 'next/link'
import {
  calculateReadingTime,
  formatDate,
  getAuthorPath,
  getCategoryColor,
  getFirstCategory,
  getPostAuthor,
  toPlainText,
} from '@/lib/utils'

export default function PostMeta({
  post,
  showAuthor = true,
  showDate = true,
  size = 'default',
}) {
  const author = getPostAuthor(post)
  const category = getFirstCategory(post)
  const color = getCategoryColor(category?.slug || 'default')
  const readingTime = calculateReadingTime(post?.content?.rendered)
  const isSmall = size === 'small'

  return (
    <div className={`flex flex-wrap items-center gap-2 ${isSmall ? 'text-xs' : 'text-sm'} text-text-secondary`}>
      {category && (
        <Link
          href={`/${category.slug}`}
          className={`category-badge ${color} hover:opacity-90 transition-opacity`}
        >
          {category.name}
        </Link>
      )}

      {showAuthor && author && (
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <Link href={getAuthorPath(author)} className="hover:text-primary">
            {toPlainText(author.name)}
          </Link>
        </span>
      )}

      {showDate && (
      <span className="flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDate(post?.date)}</span>
      </span>
      )}

      <span className="flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{readingTime}</span>
      </span>
    </div>
  )
}
