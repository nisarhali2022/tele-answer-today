import Link from 'next/link'
import { getLatestPosts } from '@/lib/wordpress'
import { getFirstCategory, toPlainText } from '@/lib/utils'

export default async function FooterRecentPosts() {
  const recentPosts = await getLatestPosts(5)

  return (
    <ul className="space-y-4">
      {recentPosts.map((post) => {
        const categorySlug =
          getFirstCategory(post)?.slug || 'uncategorized'
        return (
          <li key={post.id} className="flex gap-3 group">
            <span className="text-accent font-bold text-lg leading-none mt-0.5 flex-shrink-0">
              ›
            </span>
            <Link
              href={`/${categorySlug}/${post.slug}`}
              className="text-gray-300 group-hover:text-white text-sm leading-snug transition-colors line-clamp-2"
            >
              {toPlainText(post.title?.rendered)}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
