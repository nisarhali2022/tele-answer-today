import Link from 'next/link'
import { getAuthorPath, getPostAuthor, toPlainText } from '@/lib/utils'

export default function AuthorBox({ post }) {
  const author = getPostAuthor(post)
  if (!author?.name) return null

  const description = toPlainText(author.description || '').trim()
  const avatarUrl =
    author.avatar_urls?.['96'] ||
    author.avatar_urls?.['48'] ||
    author.avatar_urls?.['24']

  return (
    <section
      className="mt-8 flex items-start gap-4 rounded-lg border border-border bg-surface p-5"
      aria-label="About the author"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          width="64"
          height="64"
          loading="lazy"
          className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
        >
          {author.name.trim().charAt(0).toUpperCase()}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Written by
        </p>
        <h2 className="mt-1 font-heading text-lg font-bold text-text-primary">
          <Link href={getAuthorPath(author)} className="hover:text-primary">
            {toPlainText(author.name)}
          </Link>
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
