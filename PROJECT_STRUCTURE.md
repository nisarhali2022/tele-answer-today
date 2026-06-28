# Tele Answer Today Project Structure

## 1. Top-Level Layout

```text
tele-answer-today/
|-- app/                 Next.js routes, layouts, metadata, and API handlers
|-- components/          Reusable server and client UI components
|-- hooks/               Client-side React hooks
|-- lib/                 WordPress, parsing, TOC, constants, and utility logic
|-- public/              Static public assets
|   |-- assets/tele-answer-today-og.webp   fallback Open Graph image
|   |-- assets/          Local logo, favicon, and homepage step images
|-- styles/              Global Tailwind/CSS styles
|-- package.json         Scripts and dependencies
|-- SEO_ANALYSIS.md      Detailed SEO audit and optimization roadmap
|-- next.config.js       Next.js image and response-header configuration
|-- tailwind.config.js   Theme and content scanning configuration
|-- postcss.config.js    Tailwind and Autoprefixer pipeline
|-- jsconfig.json        `@/*` import alias
|-- .env.local           Local secrets; ignored by Git
```

## 2. Route Map

| URL | File | Data/API calls | Main output |
| --- | --- | --- | --- |
| `/` | `app/page.jsx` | `getDailyQuizPost`, `getHomepageQuizPage`, `getPosts`, quiz/FAQ parsers | Daily quiz and latest news |
| `/blog` | `app/blog/page.jsx` | `getPosts` | Paginated all-post archive |
| `/search?q=...` | `app/search/page.jsx` | `searchPosts` | Dynamic search results |
| `/<slug>` | `app/[slug]/page.jsx` | Category API, then page API | Category archive or WP page |
| `/<category>/<post>` | `app/[slug]/[post_slug]/page.jsx` | Post and related-post APIs | Article detail |
| `/tag/<slug>` | `app/tag/[slug]/page.jsx` | Tag and posts APIs | Tag archive |
| `/about-us` | `app/about-us/page.jsx` | `getPageBySlug('about-us')` | Canonical About page |
| `/contact-us` | `app/contact-us/page.jsx` | `getPageBySlug('contact-us')` | Canonical Contact page |
| `/about` | `app/about/page.jsx` | None | Permanent redirect to `/about-us` |
| `/contact` | `app/contact/page.jsx` | None | Permanent redirect to `/contact-us` |
| `/privacy-policy` | `app/privacy-policy/page.jsx` | WP page API | Privacy policy |
| `/editorial-policy` | `app/editorial-policy/page.jsx` | `getPageBySlug('editorial-policy')` | Editorial policy |
| `/corrections-policy` | `app/corrections-policy/page.jsx` | `getPageBySlug('corrections-policy')` | Corrections policy |
| `/admin/quiz` | `app/admin/quiz/page.jsx` | `GET/POST /api/quiz` | Quiz editor |
| `/api/admin/session` | `app/api/admin/session/route.js` | Signed cookie auth | Login/session/logout |
| `/api/quiz` | `app/api/quiz/route.js` | WordPress posts API | Read/write daily quiz post |
| `/api/revalidate` | `app/api/revalidate/route.js` | Next cache API | On-demand revalidation |
| `/api/cron/midnight` | `app/api/cron/midnight/route.js` | Next cache API | Daily homepage invalidation |
| `/api/cron/seo-preupdate` | `app/api/cron/seo-preupdate/route.js` | Next cache API | 6 PM PKT SEO date invalidation |
| `/sitemap_index.xml` | `app/sitemap_index.xml/route.js` | Sitemap helpers | Sitemap index |
| `/post-sitemap.xml` | `app/post-sitemap.xml/route.js` | WordPress posts | Blog and post URLs |
| `/page-sitemap.xml` | `app/page-sitemap.xml/route.js` | WordPress pages/quiz | Homepage and page URLs |
| `/category-sitemap.xml` | `app/category-sitemap.xml/route.js` | Categories/posts | Category URLs |
| `/robots.txt` | `app/robots.js` | None | Crawler rules |
| not found | `app/not-found.jsx` | None | Custom 404 |

`app/layout.jsx` wraps every route with `Header`, `Footer`, one self-hosted
Inter font, global CSS, metadata defaults, and the production-only AdSense
script guard.

`Header` is server-rendered and fixed at the top of the viewport. It renders
desktop dropdowns from `NAV_LINKS.children`. `HeaderControls` is the small
client component that handles search expansion and mobile menu open/close
state. Mobile navigation renders nested submenu links for the same `children`
data and closes after a link selection.

## 3. Library Modules

### `lib/constants.js`

Central configuration consumed by the layout, navigation, SEO, WordPress
client-adjacent helpers, ads, and components. It intentionally stores the
public site URL, public asset paths, navigation, ad slots, Google Analytics,
Google AdSense, Search Console verification, colors, and cache duration. These
integration values are static and should not be managed through WordPress. It
no longer stores a WordPress API URL.

Exports:

- `SITE_CONFIG`
- `NAV_LINKS`
- `AD_SLOTS`
- `CATEGORY_COLORS`

### `lib/wordpress.js`

The server-side WordPress REST client.

| Function | WordPress endpoint | Used by |
| --- | --- | --- |
| `getPosts` | `/posts` | Home, blog, tag, popular widget |
| `getPostsByCategory` | `/posts?categories=` | `[slug]` category archive |
| `getPostBySlug` | `/posts?slug=` | Post detail |
| `getDailyQuizPost` | `/posts?slug=daily-quiz` | Homepage quiz cards |
| `getHomepageQuizPage` | `/pages?slug=telenor-answer-today` | Homepage and homepage metadata |
| `getLatestPosts` | `/posts?orderby=date` | Footer, sidebar/recent widget |
| `getMostCommentedPosts` | `/comments`, then `/posts?orderby=include` | Sidebar |
| `getRelatedPosts` | `/posts?categories=&exclude=` | Post detail |
| `getCategories` | `/categories` | Sidebar, menus |
| `getCategoryBySlug` | `/categories?slug=` | `[slug]` |
| `getTagBySlug` | `/tags?slug=` | Tag archive |
| `getPageBySlug` | `/pages?slug=` | Static and dynamic WP pages |
| `searchPosts` | `/posts?search=` | Search route |
| `getAllPostSlugs` | paginated `/posts` | Sitemap |
| `getAllCategorySlugs` | `/categories` | Static params and sitemap |

All public CMS calls use Next.js fetch caching. Most use the global one-hour
revalidation value. Slug exclusions are resolved to post IDs and sent to
WordPress through its native `exclude` query so pagination totals remain
accurate. Requests retry once for transient failures. Successful empty slug
responses return `null`; repeated CMS failures throw `WordPressApiError`.

`app/error.jsx` handles route-level temporary failures, while
`app/global-error.jsx` covers failures that also affect the root layout.

### `lib/utils.js`

Presentation helpers for dates, reading time, plain text, excerpts, category
colors, media, authors, categories, HTML ad-marker insertion, and responsive
WordPress body images.

`prepareWordPressContent()` is the standard rendering pipeline for WordPress
body HTML. It removes embedded H1 blocks, rewrites public backend links from
`wp.teleanswertoday.pk` to the public root where appropriate, optimizes
WordPress images, and wraps standalone WordPress tables in `.wp-table-scroll`
so wide tables can scroll horizontally on mobile. Use this helper before
rendering `page.content.rendered` or `post.content.rendered` with
`dangerouslySetInnerHTML`.

Main callers: post cards, post pages, metadata functions, widgets, homepage,
footer, and breadcrumbs.

### `lib/quizParser.js`

- `parseQuizTables`: converts WordPress quiz table HTML into question objects.
- `parseFaqs`: extracts `Q:` and `A:` pairs from plain text.
- Karachi date helpers are exported but currently unused.

### `lib/toc.js`

Finds `h1` through `h4` elements in WordPress HTML, creates IDs where needed,
and returns both modified HTML and table-of-contents entries.

### `lib/date.js`

Provides canonical `Asia/Karachi` ISO and display-date helpers for the
homepage, quiz API, admin panel, parser compatibility exports, cron routes,
and sitemap routes. It also exports six-hour-early SEO date helpers used only
for homepage metadata/schema and homepage sitemap freshness.

### `lib/wordpressConfig.js`

Provides one WordPress REST API URL resolver for public reads, sitemap
generation, and authenticated quiz writes. `WORDPRESS_API_URL` and the
backward-compatible `NEXT_PUBLIC_WORDPRESS_API_URL` can override the backend,
but the module defaults to `https://wp.teleanswertoday.pk/wp-json/wp/v2` so
Vercel builds do not fail when the optional URL env var is missing.

### `styles/globals.css`

Global Tailwind layers plus application CSS for article typography, WordPress
body content, ad placeholders, and responsive content safety. `.wp-table-scroll`
is the standard wrapper for rendered WordPress tables; it keeps the page from
scrolling sideways while allowing the table area itself to scroll on mobile.

### `hooks/useSearch.js`

A reusable client search-form hook retained for `SearchWidget`. The global
header no longer uses it because header search is a native server-rendered GET
form.

## 4. Component Map

### Layout

| File | Type | Calls/uses |
| --- | --- | --- |
| `components/layout/Header.jsx` | Server | navigation, logo, `HeaderControls` |
| `components/layout/HeaderControls.jsx` | Client | search toggle and mobile navigation state |
| `components/layout/Footer.jsx` | Server | static four-column footer and social icon row |
| `components/layout/FooterRecentPosts.jsx` | Async Server | Legacy/unused recent-post footer helper |
| `components/layout/Sidebar.jsx` | Server | recent, popular, and category widgets |

### Home

| File | Input | Responsibility |
| --- | --- | --- |
| `QuizAnswerCards.jsx` | parsed questions | Questions, options, correct answers |
| `LatestNewsGrid.jsx` | WordPress posts | Homepage news cards without visible dates |
| `QuizInfoSections.jsx` | none | Static SEO/information sections |
| `StepsSection.jsx` | none | Participation steps and images |
| `FaqSection.jsx` | parsed FAQs | Parsed or fallback FAQ list |

### Posts

| File | Input | Responsibility |
| --- | --- | --- |
| `PostGrid.jsx` | posts, `showDate` | Two-column configurable card collection |
| `PostCard.jsx` | post, `showDate` | Linked article preview |
| `FeaturedImage.jsx` | post | WordPress image or color fallback |
| `AuthorBox.jsx` | post | End-of-content WordPress author profile |
| `PostMeta.jsx` | post | Configurable category, author, date, and reading time |
| `TableOfContents.jsx` | TOC entries | Expandable client TOC |

### Widgets

| File | Intended input | Current behavior |
| --- | --- | --- |
| `SearchWidget.jsx` | none | Client search form |
| `CategoryList.jsx` | categories | Renders categories supplied by `Sidebar` |
| `RecentPosts.jsx` | posts | Renders recent posts supplied by `Sidebar` |
| `PopularPosts.jsx` | posts | Renders popular posts supplied by `Sidebar` |

### Navigation, Ads, and UI

- `Pagination.jsx`: builds previous, numbered, and next links while preserving
  route-specific query parameters such as search terms.
- `Breadcrumbs.jsx`: visual breadcrumbs plus JSON-LD; the final title uses
  responsive truncation limits up to `560px`.
- `AdSenseUnit.jsx`: client-side AdSense unit.
- `AdBanner.jsx`: position-to-slot wrapper that renders only with valid
  environment configuration and reserves stable layout space.
- `AdInArticle.jsx`: fluid in-article ad.
- `ShareButtons.jsx`: WhatsApp, Facebook, X, and clipboard sharing.
- `lib/schema.js`: safely serializes JSON-LD for site, article, breadcrumb,
  and author schemas.
- `app/author/[slug]/page.jsx`: crawlable author profile with bio, Person
  schema, and paginated posts.
- `components/layout/FooterRecentPosts.jsx`: legacy helper retained in source
  but no longer used by the current static footer.
- `LoadingSpinner.jsx`: Suspense fallback.

## 5. Detailed Call Flows

### Public page request

```text
Browser
  -> app route
  -> lib/wordpress.js
  -> WordPress REST API
  -> lib transformation helpers
  -> route JSX
  -> shared components
  -> HTML response / cached result
```

### Homepage quiz

```text
app/page.jsx
  -> getDailyQuizPost()
     -> WordPress /posts?_embed&slug=daily-quiz
     -> cache tag "quiz"
  -> getHomepageQuizPage()
     -> WordPress /pages?_embed&slug=telenor-answer-today
  -> getPosts({ perPage: 12, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: "news" })
  -> parseQuizTables(dailyQuizPost.content.rendered)
  -> parseFaqs(homepagePage.content.rendered)
  -> QuizAnswerCards
  -> LatestNewsGrid without visible publication dates
```

### Article page

```text
app/[slug]/[post_slug]/page.jsx
  -> getPostBySlug(post_slug)
  -> verify URL prefix matches getFirstCategory(post).slug
  -> permanently redirect mismatched prefixes
  -> getRelatedPosts(firstCategory.id, post.id)
  -> generateTocAndInjectIds(content)
  -> injectAdAfterFirstParagraph(content, marker)
  -> FeaturedImage + PostMeta(showDate=false) + TableOfContents
  -> WordPress HTML + AdInArticle + AuthorBox
  -> ShareButtons + related PostCards(showDate=false)
```

### Admin quiz update

```text
app/admin/quiz/page.jsx
  -> POST /api/admin/session with the admin secret
  -> receive a signed HTTP-only session cookie
  -> POST /api/quiz with the session cookie
  -> validate five questions and four options each
  -> find WordPress post slug "daily-quiz"
     -> successful [] means missing
     -> network/429/5xx/invalid JSON retries once
     -> repeated failure stops with HTTP 503
  -> format questions as HTML tables
  -> WordPress POST once if missing, otherwise PUT using Basic Authentication
  -> revalidateTag("quiz")
  -> homepage quiz fetch becomes stale
```

The quiz editor must not update WordPress pages, the WordPress Front Page, or
page ID `640`. Static React homepage content remains app-owned and is not
changed by quiz saves.

### Sidebar

Current behavior:

```text
Sidebar
  -> fetch categories, recent posts, most-commented posts
  -> pass values to widgets
  -> widgets render those values without additional requests
  -> render cards with a consistent 24px vertical gap
  -> render titles only; sidebar publication dates are hidden
  -> Search and advertisement cards are currently disabled
```

### Footer

Current behavior:

```text
Footer
  -> static About us, Menu, More Link, and Disclaimer columns
  -> local logo asset from SITE_CONFIG.logoUrl
  -> social icon row with placeholder href values
  -> no WordPress request from the root layout footer
```

## 6. API Contracts

### `/api/admin/session`

- `GET`: returns `{ "authenticated": true|false }`.
- `POST`: validates `{ "secret": "..." }` and creates a signed HTTP-only
  session cookie.
- `DELETE`: clears the admin session cookie.

The cookie is same-site, secure in production, and expires after eight hours.

### `GET /api/quiz`

Requires a valid admin session cookie.

Response:

```json
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ],
  "date": "2026-06-14",
  "id": 123
}
```

### `POST /api/quiz`

Requires a valid admin session cookie created by `POST /api/admin/session`.

Body:

```json
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}
```

Exactly five questions and exactly four options per question are required.
Each option must be non-empty and no longer than 150 characters, each question
is limited to 300 characters, and the answer must match one option. The API
HTML-escapes all values before saving them to WordPress. The server assigns and
returns the current Karachi date automatically.

### `GET /api/cron/seo-preupdate`

Vercel Cron calls this endpoint daily at 13:00 UTC using:

```text
Authorization: Bearer CRON_SECRET
```

It invalidates `/`, `/page-sitemap.xml`, and `/sitemap_index.xml`, allowing
the next request to regenerate homepage metadata/schema and sitemap freshness
with the six-hour-early SEO date at 6:00 PM PKT.

### `GET /api/cron/midnight`

Vercel Cron calls this endpoint daily using:

```text
Authorization: Bearer CRON_SECRET
```

It invalidates `/`, `/page-sitemap.xml`, and `/sitemap_index.xml`, allowing
the next request to regenerate the ISR homepage with the current visible
Karachi date.

### `POST /api/revalidate`

Required header:

```text
x-revalidate-secret: REVALIDATE_SECRET
```

Optional body:

```json
{
  "slug": "tech",
  "type": "category"
}
```

The homepage is always revalidated.

## 7. Route and Link Conventions

The UI generally uses:

- Category: `/<category-slug>`
- Post: `/<category-slug>/<post-slug>`
- Tag: `/tag/<tag-slug>`
- WordPress page: `/<page-slug>`
- Canonical About page: `/about-us`
- Canonical Contact page: `/contact-us`
- Non-root URLs: no trailing slash

`lib/seo.js` centralizes canonical URLs, route metadata, page-number
validation, and taxonomy descriptions. Tag archives are intentionally
`noindex, follow`; blog/category/search/tag pagination returns 404 for invalid
or out-of-range page numbers. Blog, category, and tag page 2+ metadata uses a
self-referencing canonical containing the active `page` query parameter.

`lib/wordpress.js` uses selective `_fields` and `_embed` values for public
queries. `lib/sitemap.js` reuses its retry policy, aborts incomplete
generation, includes author profiles, understands lazy/srcset images, and
sets the homepage modification time to the six-hour-early Karachi SEO date.

Performance-specific behavior:

- `next.config.js` negotiates AVIF/WebP and caches optimized images for one
  day.
- `next.config.js` derives the allowed WordPress media host from
  `WORDPRESS_API_URL`.
- Cards request smaller WordPress media variants with responsive `sizes`.
- Homepage participation-step images, logo, and favicon are served from
  `public/assets/`.
- `.render-deferred` uses `content-visibility: auto` for long below-fold
  homepage information.
- Inter is the only application font; headings, body, and WordPress-rendered
  article content share the same file family. The former Tailwind Typography
  plugin was replaced by compact custom `.prose` CSS.

Any code producing `/category/<slug>` or a one-segment post URL is inconsistent
with the implemented routes.

## 8. Necessary Remaining Work

| Priority | Area | Required change |
| --- | --- | --- |
| High | Quiz parsing | Parse question text without requiring a trailing `?` |
| High | Quiz UI | Render a visible unavailable state when quiz HTML is empty or malformed |
| Deployment | Live routing | Verify category/article URLs and production-source parity after deployment |

Quality tooling now includes `eslint.config.mjs`, `npm run lint`, and 15 tests
under `test/`. Shared quiz validation/escaping lives in `lib/quiz.js`.
`optimizeContentImages()` preserves WordPress responsive markup and fills
missing dimensions, `sizes`, loading, and decoding attributes without rewriting
WordPress media to Vercel `/_next/image` proxy URLs.

## 9. Latest Structure Update - 2026-06-20

New or recently changed files and responsibilities:

| File | Responsibility |
| --- | --- |
| `lib/constants.js` | Central static public IDs for Analytics, Search Console, AdSense publisher `ca-pub-9444471613078101`, shared ad slot `4789150646`, site URL, and WordPress API URL configuration. |
| `public/ads.txt` | Static AdSense seller authorization file served from `/ads.txt`; this remains repo-owned, not WordPress-managed. |
| `app/layout.jsx` | Root metadata, Search Console verification meta tag, Google Analytics script, and global native AdSense script loaded from static app config. |
| `components/ads/LazyAdSenseUnit.jsx` | Client-side ad loader that uses `IntersectionObserver` so below-fold ads load as the user approaches them. |
| `components/ads/AdBanner.jsx` | Shared display ad wrapper; top placement is eager, lower placements are lazy. |
| `components/ads/AdInArticle.jsx` | In-article ad placement using the same lazy AdSense loader. |
| `components/home/LatestNewsGrid.jsx` | Client-side randomization for homepage Latest News cards. |
| `lib/homeFaqs.js` | Shared homepage FAQ selection helper; keeps visible FAQ UI and `FAQPage` JSON-LD aligned and capped at six valid items. |
| `components/widgets/RecentPosts.jsx` | Client-side randomization for Recent Posts while keeping server-fetched post data. |
| `components/layout/Sidebar.jsx` | Fetches larger post pools for randomized Recent Posts and keeps popular-post fallback behavior. |
| `components/layout/Footer.jsx` | Static footer copy and requested social links/icons. |
| `components/layout/Header.jsx` | Mobile-safe header shell and logo sizing. |
| `components/layout/HeaderControls.jsx` | Search and mobile menu state; closes mobile menu after link selection. |
| `components/home/QuizAnswerCards.jsx` | Quiz answer card UI, including centered number badge text. |
| `app/contact-us/page.jsx` | Public contact form layout using the public email address. |
| `app/about-us/page.jsx` | Improved public About page card and alignment. |
| `app/sitemap.xml/route.js` | Permanent redirect from `/sitemap.xml` to `/sitemap_index.xml`. |
| `app/robots.js` | Public crawl policy and sitemap index reference. |
| `lib/utils.js` | WordPress content URL/email normalization from backend `wp.` host to public root-domain display text. |

Important call flow updates:

- Homepage server fetches a larger latest-post pool, then
  `LatestNewsGrid.jsx` shuffles it in the browser.
- Sidebar server fetches recent posts once, then `RecentPosts.jsx` shuffles
  display order in the browser.
- Google Ads configuration is static application configuration. WordPress
  content must not manage or overwrite publisher IDs, slot IDs, script loading,
  or `ads.txt`.
- Local development suppresses AdSense script/ad-unit rendering; production
  keeps static Google Ads IDs and native script loading.
- Ad containers render reserved layout space first; `LazyAdSenseUnit.jsx`
  initializes AdSense when the placement is eager or near the viewport.
- WordPress-backed media components render with `unoptimized` so public pages
  use canonical WordPress media URLs instead of Vercel image proxy URLs.
- Homepage `FAQPage` JSON-LD is generated from the same visible FAQ list used by
  `FaqSection`, capped at six valid question/answer pairs.
- WordPress-rendered content is normalized before public rendering so users do
  not see backend URLs in ordinary page text.
