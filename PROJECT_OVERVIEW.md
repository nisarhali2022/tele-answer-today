# Tele Answer Today Project Overview

## 1. Purpose

This repository contains a content-focused website for daily Telenor quiz
answers, telecom/news articles, and supporting informational pages.

The application uses:

- WordPress REST API for posts, pages, categories, tags, media, authors, and
  the `telenor-answer-today` homepage source page.
- WordPress-managed body content for public pages, policies, articles,
  archives, categories, tags, media, authors, quiz tables, and homepage FAQs.
- Static React configuration for permanent site integrations such as Google
  Analytics, Google AdSense, Google Search Console verification, navigation,
  local public assets, and site settings.
- A protected browser admin page for updating the five daily quiz questions.

WordPress is the production data store. The Next.js application has no
separate application database.

## 2. Technology

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19 |
| Styling | Tailwind CSS 3 with compact custom article/prose styles |
| CMS | WordPress REST API v2 |
| Rendering | Static generation, ISR, and dynamic server rendering |
| Images | `next/image`, local public assets, and env-derived WordPress media host |
| Ads | Google AdSense integration |
| Language | JavaScript and JSX |

## 3. Main Features

- Daily quiz answers on the homepage.
- Dynamic Karachi date that changes daily without requiring a quiz update.
- Latest-news homepage cards.
- Category, tag, blog, and search archives with pagination.
- Canonical `/<category>/<post>` article routes.
- Related posts, table of contents, breadcrumbs, share buttons, and sidebar.
- End-of-content WordPress author profile on article pages.
- SEO metadata, JSON-LD, robots output, and split XML sitemaps.
- Protected five-question quiz editor.
- On-demand and scheduled cache revalidation.
- Temporary-unavailable pages for repeated WordPress failures.

## 4. Architecture

1. A request enters a route under `app/`.
2. Server components call `lib/wordpress.js`.
3. `lib/wordpressConfig.js` supplies the shared WordPress API URL from
   environment variables only.
4. WordPress responses use Next.js caching and revalidation.
5. Helpers parse quiz HTML, generate TOC IDs, format dates, and build URLs.
6. Route components compose reusable components from `components/`.
7. Client components provide search, sharing, navigation, ads, and admin
   interactions.

Most public content uses one-hour ISR caching. WordPress requests retry once
for network failures, HTTP 429/5xx responses, and invalid JSON.

Public content should be dynamic by default. New pages, policy text, article
body copy, FAQs, category content, and media should come from WordPress unless
there is a clear application-level reason to keep the behavior in code. The
homepage intro, explanatory SEO sections, and participation steps are currently
app-owned React content. Google Analytics, Google AdSense, and Google Search
Console verification are intentionally static in `lib/constants.js` and
`app/layout.jsx` so tracking, ads, and verification remain consistent across
all future CMS updates.

## 5. Core Flows

### Homepage

`app/page.jsx` loads these resources in parallel:

```text
getHomepageQuizPage()
getPosts({ perPage: 12, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: "news" })
```

`getHomepageQuizPage()` explicitly requests the fixed WordPress page slug
`telenor-answer-today` and uses the `quiz` cache tag. Publishing a newer normal
article cannot replace the homepage quiz.

The page parses quiz tables and FAQs, calculates the current
`Asia/Karachi` date, and renders quiz answers, latest news, static
informational sections, participation steps, ads, FAQs, and the sidebar.

Homepage Latest News cards intentionally do not display publication dates.

### Category and Blog Archives

Category routes use `app/[slug]/page.jsx`; `/blog` uses
`app/blog/page.jsx`. Both exclude the homepage source and legacy quiz slugs
through the WordPress query so pagination totals remain correct.

Visible publication dates are hidden on category and blog cards. Search and
tag archives retain their current date presentation.

### Article

`app/[slug]/[post_slug]/page.jsx`:

1. Fetches the post by `post_slug`.
2. Resolves its primary category.
3. Permanently redirects an incorrect category prefix.
4. Generates valid, unique TOC IDs.
5. Inserts the React in-article ad after the first paragraph.
6. Renders the author profile after the WordPress content.
7. Renders sharing controls and related posts.

The visible publication date is hidden on the article and its related cards.
Published and modified dates remain in Open Graph and JSON-LD metadata for
search engines.

### Quiz Administration

The admin flow is:

```text
POST /api/admin/session
  -> validate ADMIN_SECRET
  -> create signed HTTP-only session cookie

GET /api/quiz
  -> load the existing telenor-answer-today page

POST /api/quiz
  -> validate exactly five questions and four options each
  -> HTML-escape all stored fields
  -> confirm whether telenor-answer-today exists
  -> update the page with PUT
  -> revalidateTag("quiz")
```

The WordPress existence lookup returns `null` only after a successful empty
array response. Network, rate-limit, server, malformed-JSON, or malformed-data
failures retry once and then return HTTP 503. The save is stopped, preventing
an outage from being mistaken for a missing post.

### Daily Date Refresh

`vercel.json` calls `/api/cron/midnight` at `19:00 UTC`, which is midnight in
Karachi. The endpoint revalidates `/`; the next request regenerates the
homepage with the new date even when quiz answers were not edited.

## 6. Current UI Behavior

- The global header is fixed at the top with a responsive spacer so content
  does not slide underneath it. Desktop navigation appears at `xl` widths;
  tablet and mobile widths use the mobile menu.
- Navigation matches the live Tele Answer Today intent, including dropdown or
  nested submenu links for Telenor Packages and Telenor Codes.
- Article breadcrumbs allow substantially more title text before truncating:
  up to `70vw`, `420px` on small screens, and `560px` on large screens.
- Sidebar cards have a consistent `24px` vertical gap.
- The sidebar currently renders Recent Posts, Popular Posts, and Categories
  without visible publication dates. Its Search and advertisement cards are
  not rendered.
- The footer is a static four-column layout with About, Menu, More Link, and
  Disclaimer content plus social links. It no longer fetches WordPress posts.
- Article pages display an author box with name, optional description, and
  avatar or initial fallback.
- Article, static WordPress-backed pages, and dynamic WordPress page templates
  render one visible page-title H1. WordPress body content is passed through
  `prepareWordPressContent()` so any stored content H1 blocks are removed
  before rendering.
- Visible publish dates are hidden from articles, related cards, blog cards,
  category cards, and homepage Latest News cards.
- The root document uses `lang="en-PK"`, footer social icons use configured
  profile URLs, and AdSense loads only when a publisher ID is configured.
- A branded 1200x630 fallback social image is available at
  `public/assets/tele-answer-today-og.webp`.
- Fixed logo, favicon, and homepage participation-step images are served from
  `public/assets/` so they do not depend on the old WordPress uploads path
  after the main domain moves to Vercel.

## 7. Configuration

| Variable | Purpose |
| --- | --- |
| `WORDPRESS_API_URL` | Required server-side WordPress REST API URL |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Backward-compatible URL fallback |
| `NEXT_PUBLIC_ADSENSE_ID` | Public AdSense publisher/client ID |
| `NEXT_PUBLIC_AD_SLOT_TOP` | Top horizontal ad slot |
| `NEXT_PUBLIC_AD_SLOT_MID` | Mid-page horizontal ad slot |
| `NEXT_PUBLIC_AD_SLOT_IN_ARTICLE` | In-article fluid ad slot |
| `NEXT_PUBLIC_AD_SLOT_SIDEBAR` | Sidebar ad slot |
| `NEXT_PUBLIC_AD_SLOT_AFTER_CONTENT` | After-content ad slot |
| `NEXT_PUBLIC_AD_SLOT_BOTTOM` | Bottom horizontal ad slot |
| `WP_ADMIN_USER` | WordPress API username |
| `WP_ADMIN_PASS` | WordPress application password |
| `ADMIN_SECRET` | Admin login and session-signing secret |
| `REVALIDATE_SECRET` | Protects POST cache revalidation |
| `CRON_SECRET` | Protects scheduled midnight revalidation |

Site constants, route sizes, AdSense slots, navigation, colors, local image
paths, and the one-hour revalidation duration are defined in
`lib/constants.js`.

Current local admin defaults for development live in `.env.local`. Production
must set its own `ADMIN_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`,
`WP_ADMIN_USER`, and `WP_ADMIN_PASS` in Vercel.

`WORDPRESS_API_URL` must be configured in Vercel, for example:

```text
WORDPRESS_API_URL=https://wp.teleanswertoday.pk/wp-json/wp/v2
```

There is no hardcoded WordPress API fallback in tracked source. Local secrets
and the real local API URL live in `.env.local`, which is ignored by Git.

## 8. Deployment Model

The intended production architecture is headless WordPress:

```text
https://teleanswertoday.pk
  -> Vercel
  -> public Next.js website

https://wp.teleanswertoday.pk
  -> Hostinger
  -> WordPress admin, media, and REST API backend
```

The main domain remains in `SITE_CONFIG.url` and `SITE_CONFIG.siteUrl` because
it is the public canonical website URL for metadata, schema, sitemaps, robots,
and share links. It does not mean the domain must remain hosted on Hostinger.

The WordPress backend URL must be supplied through Vercel environment
variables. The `wp.` subdomain should remain on Hostinger and should not be
deleted when the root domain DNS is pointed to Vercel.

## 9. Sitemaps

The site publishes:

- `/sitemap_index.xml`
- `/post-sitemap.xml`
- `/page-sitemap.xml`
- `/category-sitemap.xml`

Post URLs use `/<category>/<post>`; categories use `/<category>`; pages use
`/<page>`. Non-root URLs consistently omit trailing slashes, and `robots.txt`
points to the sitemap index.

The page sitemap also includes crawlable `/author/<slug>` profiles. Sitemap
collection uses the shared WordPress retry policy and aborts rather than
publishing partial XML. Homepage `lastmod` follows the Karachi date rollover.

## 10. Verification Status

Reviewed and updated on June 19, 2026:

| Check | Current result |
| --- | --- |
| Hardcoded backend/API secret scan | Passed: no tracked-source backend URL or secret matches |
| `.env.local` tracking check | Passed: ignored by `.gitignore` and not tracked |
| JavaScript route syntax checks | Covered by lint/build |
| `git diff --check` | Previously passed; current verification focused on lint/test/build |
| Focused TOC behavior simulation | Covered by automated tests and build |
| Admin WordPress lookup simulations | Covered by automated tests |
| `npm.cmd run build` | Passed on June 19, 2026 |
| ESLint | Passed with `npm.cmd run lint` |
| Automated test suite | 15 tests passed with `npm.cmd run test` |

The production build compiled, linted, type-checked, and generated all 28 routes.
Browser checks verified Organization/WebSite, Article, Person, author profile,
canonical, image-priority, no-hydration header, disabled-ad, responsive-image,
and deferred-rendering output. Local HTTP checks verified sitemap author
entries, homepage `lastmod`, and extracted images.

The final performance build reports approximately `628 B` of route-specific
JavaScript for the homepage, `630 B` for blog/tag archives, and `2.56 kB` for
article routes. The shared `102 kB` is primarily the Next.js/React runtime.

## 11. Remaining Improvements

### Required functional fixes

1. Fix quiz parsing so a question does not need to end with `?`.
2. Show a visible temporary-unavailable message when quiz HTML is missing or
   malformed instead of rendering an empty quiz section.

### Remaining SEO and deployment validation

1. Verify after deployment that valid category and article URLs return their
   own content instead of redirecting to `/blog`.
2. Confirm the production domain is serving this repository's metadata,
   schema, sitemap, canonical, and routing implementation.

Paginated blog, category, and tag canonicals are already self-referencing and
are no longer part of the remaining work.

Engineering safeguards completed on June 15, 2026:

- ESLint 9 with the Next.js Core Web Vitals rules runs non-interactively.
- The native Node test suite covers quiz validation/escaping, pagination,
  canonical generation, archive validation, Karachi midnight, WordPress
  missing-versus-unavailable behavior, and body-image processing.
- WordPress body images retain existing responsive markup or receive inferred
  dimensions, fallback dimensions, responsive Next.js optimizer sources,
  `sizes`, lazy loading, and asynchronous decoding.

Additional migration safeguards completed on June 19, 2026:

- WordPress API configuration is environment-only.
- Fixed public assets were moved from WordPress upload URLs into
  `public/assets/`.
- `next.config.js` derives the WordPress media host from `WORDPRESS_API_URL`.
- Tracked source contains no hardcoded backend API URL, WordPress backend host,
  WordPress API path, old main-domain upload path, or hardcoded local
  passwords/secrets.

See `PROJECT_STRUCTURE.md` for the file and call map. See `BUG_FIXING.md` for
the issue history, resolved changes, and open work. See `SEO_ANALYSIS.md` for
the detailed technical, on-page, content, and performance SEO audit.

## Latest Update - 2026-06-20

The project is now configured for the public Next.js site to run on Vercel while
WordPress remains the backend CMS on `wp.teleanswertoday.pk`.

Latest completed work:

- Google Analytics, Google Search Console verification, and Google AdSense IDs
  are static application constants in `lib/constants.js`.
- `public/ads.txt` is static and contains the authorized Google AdSense seller
  line.
- The global AdSense script uses `lazyOnload` to reduce Core Web Vitals impact.
- Top ad placement loads eagerly; lower, sidebar, and in-article ad placements
  load through an `IntersectionObserver` before the user reaches them.
- Homepage Latest News cards and sidebar Recent Posts now randomize client-side
  from larger WordPress post pools.
- Footer social links were updated for LinkedIn, Facebook, X, Instagram,
  YouTube, TikTok, and Pinterest.
- Contact page now renders a public contact form layout and no longer exposes
  backend WordPress page content directly.
- About page alignment was improved with a cleaner content card layout.
- Rendered WordPress content rewrites visible backend `wp.` email/URL text to
  public root-domain text while keeping media, API, and admin system paths
  intact.
- Mobile header overflow was fixed, horizontal page overflow is hidden, and the
  mobile menu closes when a menu item is selected.
- `/sitemap.xml` now redirects to `/sitemap_index.xml`, which remains the
  preferred sitemap submitted to Google Search Console.
- `robots.txt` allows the public site, disallows `/api/`, and points crawlers to
  the sitemap index.

Current production note:

- If AdSense markup loads but the slot does not visually show an ad, check the
  slot status in DevTools. `data-ad-status="unfilled"` means Google loaded the
  ad request but did not return inventory; that is an AdSense fill issue, not a
  rendering bug in the project.
