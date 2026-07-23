import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { resolveCmsDomain } from '../cmsDomain'
import { selectRandomPosts } from '../latestNews'

const CACHE_SECONDS = 3600
const FIXED_TEMPLATE_BY_PATH = new Map([
  ['about-us', 'about'],
  ['about', 'about'],
  ['contact-us', 'contact'],
  ['contact', 'contact'],
  ['privacy-policy', 'privacy'],
  ['privacy', 'privacy'],
  ['terms', 'terms'],
  ['packages', 'packages'],
  ['editorial-policy', 'editorial-policy'],
  ['corrections-policy', 'corrections-policy'],
])

function getPublicConfig() {
  const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for public CMS reads.')
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function getCmsDomain() {
  const configuredDomain = resolveCmsDomain('', process.env.CMS_SITE_DOMAIN)
  if (!configuredDomain) {
    throw new Error('CMS_SITE_DOMAIN is required for public CMS reads.')
  }

  return configuredDomain
}

async function rpc(functionName, body, cacheKey) {
  const { supabaseUrl, supabaseAnonKey } = getPublicConfig()
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    next: { revalidate: CACHE_SECONDS, tags: ['cms', cacheKey] },
  })

  if (!response.ok) {
    throw new Error(`Public CMS RPC ${functionName} failed with ${response.status}.`)
  }

  return response.json()
}

function adaptImage(image) {
  if (!image?.url) return null
  const variants = Object.fromEntries(
    Object.entries(image.variants || {}).filter(([, variant]) => variant?.url)
  )
  return {
    url: image.url,
    alt: image.alt || '',
    caption: image.caption || '',
    width: image.width || 1200,
    height: image.height || 675,
    variants,
  }
}

function adaptCategory(category) {
  if (!category) return null
  return {
    id: category.slug,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    count: Number(category.postCount || 0),
  }
}

function adaptAuthor(author) {
  if (!author) return null
  return {
    id: author.slug,
    name: author.name,
    slug: author.slug,
    bio: author.bio || '',
    avatarUrl: author.avatar?.url || '',
  }
}

function adaptPost(post) {
  if (!post) return null
  const category = adaptCategory(post.category)
  const author = adaptAuthor(post.author)
  const featuredImage = adaptImage(post.featuredImage)
  const readingTimeMinutes = Number(post.readingTimeMinutes)

  return {
    id: post.id || post.slug,
    slug: post.slug,
    date: post.publishedAt || post.updatedAt || null,
    modified: post.updatedAt || post.publishedAt || null,
    title: post.title || '',
    excerpt: post.excerptHtml || post.excerpt || '',
    content: post.bodyHtml || '',
    readingTimeMinutes:
      Number.isFinite(readingTimeMinutes) && readingTimeMinutes > 0
        ? Math.ceil(readingTimeMinutes)
        : null,
    author,
    category,
    featuredImage,
    seo: {
      title: post.seo?.title || null,
      description: post.seo?.metaDescription || null,
      canonical: post.seo?.canonicalUrl || null,
      robots: post.seo?.robotsMeta || null,
    },
    cms: post,
  }
}

function adaptTemplate(template) {
  if (!template) return null
  const data = template.contentData || {}
  const bodyHtml = data.bodyHtml || data.bodyText || data.introHtml || data.introText || data.contactIntro || data.heroText || ''
  const author = adaptAuthor(template.author)
  const featuredImage = adaptImage(template.ogImage || data.mainImage || data.heroImage)

  return {
    id: template.templateKey,
    slug: String(template.path || '').replace(/^\//, ''),
    date: template.publishedAt || template.updatedAt || null,
    modified: template.updatedAt || template.publishedAt || null,
    title: template.title || '',
    excerpt: data.excerpt || '',
    content: bodyHtml,
    author,
    category: null,
    featuredImage,
    seo: {
      title: template.seo?.title || null,
      description: template.seo?.metaDescription || null,
      canonical: template.seo?.canonicalUrl || null,
      robots: template.seo?.robotsMeta || null,
    },
    cms: template,
  }
}

function adaptPage(page) {
  if (!page) return null
  const author = adaptAuthor(page.author)
  const featuredImage = adaptImage(page.featuredImage)

  return {
    id: page.id || page.path,
    slug: String(page.path || '').replace(/^\//, ''),
    date: page.publishedAt || null,
    modified: page.updatedAt || page.publishedAt || null,
    title: page.title || '',
    excerpt: page.excerptHtml || page.excerpt || '',
    content: page.bodyHtml || page.bodyText || '',
    author,
    category: null,
    featuredImage,
    seo: {
      title: page.seo?.title || null,
      description: page.seo?.metaDescription || null,
      canonical: page.seo?.canonicalUrl || null,
      robots: page.seo?.robotsMeta || null,
    },
    cms: page,
  }
}

const getPostsForDomain = cache(async (domain, options = {}) => {
  const page = Math.max(Number(options.page || 1), 1)
  const perPage = Math.min(Math.max(Number(options.perPage || 10), 1), 100)
  const baseRequest = {
    domain,
    category_slug: options.categorySlug || options.categoryId || null,
    author_slug: options.authorSlug || options.authorId || null,
    search: options.search || null,
  }
  const offset = (page - 1) * perPage
  const batches = []
  for (let fetched = 0; fetched < perPage; fetched += 50) {
    batches.push(rpc('list_public_posts_page', {
      ...baseRequest,
      limit_count: Math.min(50, perPage - fetched),
      offset_count: offset + fetched,
    }, `posts:${domain}:${options.categorySlug || options.categoryId || ''}:${options.authorSlug || options.authorId || ''}:${options.search || ''}:${page}:${perPage}:${fetched}`))
  }
  const results = await Promise.all(batches)
  const result = results[0] || { items: [], total: 0 }

  const excluded = new Set(options.excludeSlugs || [])
  const posts = results.flatMap((item) => item.items || [])
    .map(adaptPost)
    .filter((post) => !excluded.has(post.slug))
  const total = Number(result.total || 0)
  return { posts, total, totalPages: Math.max(Math.ceil(total / perPage), 1), invalidPage: page > 1 && posts.length === 0 }
})

const getPostBySlugForDomain = cache(async (domain, slug) => adaptPost(await rpc(
  'get_public_post', { domain, slug }, `post:${domain}:${slug}`
)))

const getCategoriesForDomain = cache(async (domain) => (
  (await rpc('list_public_categories', { domain }, `categories:${domain}`)).map(adaptCategory)
))

const getAuthorBySlugForDomain = cache(async (domain, slug) => adaptAuthor(await rpc(
  'get_public_author', { domain, author_slug: slug }, `author:${domain}:${slug}`
)))

const getPageBySlugForDomain = cache(async (domain, slug) => {
  const templateKey = FIXED_TEMPLATE_BY_PATH.get(slug)
  if (templateKey) {
    return adaptTemplate(await rpc('get_public_template_content', {
      domain,
      template_key: templateKey,
    }, `template:${domain}:${templateKey}`))
  }

  return adaptPage(await rpc('get_public_page', {
    domain,
    page_path: `/${slug}`,
  }, `page:${domain}:/${slug}`))
})

const getCurrentQuizForDomain = cache(async (domain) => rpc(
  'cms_public_get_current_quiz', {}, `quiz:${domain || 'global'}`
))
const getHomeTemplateForDomain = cache(async (domain) => rpc(
  'get_public_template_content', { domain, template_key: 'home' }, `template:${domain}:home`
))
const getSiteSettingsForDomain = cache(async (domain) => rpc(
  'get_public_site_settings', { domain }, `settings:${domain}`
))
const getContentIndexForDomain = cache(async (domain) => rpc(
  'list_public_content_index', { domain }, `content-index:${domain}`
))
const getSidebarPostListsForDomain = unstable_cache(
  async (domain, recentLimit = 5, poolSize = 12, popularLimit = 5) => {
    const safePoolSize = Math.min(Math.max(Number(poolSize) || 12, 1), 50)
    const safeRecentLimit = Math.min(Math.max(Number(recentLimit) || 5, 1), safePoolSize)
    const safePopularLimit = Math.min(Math.max(Number(popularLimit) || 5, 1), safePoolSize)
    const { posts } = await getPostsForDomain(domain, {
      perPage: safePoolSize,
      excludeSlugs: ['daily-quiz'],
    })

    return {
      recentPosts: selectRandomPosts(posts, safeRecentLimit),
      popularPosts: posts.slice(0, safePopularLimit),
    }
  },
  ['cms-sidebar-post-lists'],
  { revalidate: CACHE_SECONDS, tags: ['cms', 'sidebar-post-selection'] }
)

export async function getPosts(options = {}) { return getPostsForDomain(await getCmsDomain(), options) }
export async function getPostsByCategory(categoryId, page = 1, perPage = 10) { return getPosts({ page, perPage, categoryId, excludeSlugs: ['daily-quiz'] }) }
export async function getPostsByAuthor(authorId, page = 1, perPage = 10) { return getPosts({ page, perPage, authorId, excludeSlugs: ['daily-quiz'] }) }
export async function searchPosts(search, page = 1, perPage = 10) { return getPosts({ page, perPage, search, excludeSlugs: ['daily-quiz'] }) }
export async function getPostBySlug(slug) { return getPostBySlugForDomain(await getCmsDomain(), slug) }
export async function getLatestPosts(count = 5) { return (await getPosts({ perPage: Math.min(count, 50), excludeSlugs: ['daily-quiz'] })).posts }
export async function getMostCommentedPosts(count = 5, fallbackPosts = []) { return (fallbackPosts.length ? fallbackPosts : await getLatestPosts(count)).slice(0, count) }
export async function getSidebarPostLists(options = {}) {
  return getSidebarPostListsForDomain(
    await getCmsDomain(),
    options.recentLimit || 5,
    options.poolSize || 12,
    options.popularLimit || 5
  )
}
export async function getRelatedPosts(categoryId, excludePostId, count = 3) {
  const { posts } = await getPosts({ categoryId, perPage: Math.min(count + 1, 50) })
  return posts.filter((post) => post.id !== excludePostId).slice(0, count)
}
export async function getCategories() { return getCategoriesForDomain(await getCmsDomain()) }
export async function getCategoryBySlug(slug) { return (await getCategories()).find((category) => category.slug === slug) || null }
export async function getAuthorBySlug(slug) { return getAuthorBySlugForDomain(await getCmsDomain(), slug) }
export async function getPageBySlug(slug) { return getPageBySlugForDomain(await getCmsDomain(), slug) }
export async function getAllCategorySlugs() {
  const buildDomain = resolveCmsDomain(
    '',
    process.env.CMS_SITE_DOMAIN || 'teleanswertoday.pk'
  )
  return (await getCategoriesForDomain(buildDomain)).map((category) => ({ slug: category.slug }))
}
export async function getCurrentQuiz() { return getCurrentQuizForDomain(await getCmsDomain()) }
export async function getHomeTemplate() { return getHomeTemplateForDomain(await getCmsDomain()) }
export async function getSiteSettings() { return getSiteSettingsForDomain(await getCmsDomain()) }
export async function getContentIndex() { return getContentIndexForDomain(await getCmsDomain()) }
