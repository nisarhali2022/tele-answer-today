# Tele Answer Today Project Overview

> **Current architecture:** this project is being cut over to the shared
> Supabase Admin CMS. The authoritative current setup, environment variables,
> revalidation contract, CMS-managed Ads settings, and rollback checklist are
> documented in [SUPABASE_CMS_CUTOVER.md](SUPABASE_CMS_CUTOVER.md). The
> The older integration notes below are historical records only. They must not
> be used for publishing, credentials, or runtime configuration.

## 1. Purpose

This repository contains a content-focused website for daily Telenor quiz
answers, telecom/news articles, and supporting informational pages.

The application uses:

- WordPress REST API for posts, pages, categories, tags, media, authors, the
  `daily-quiz` quiz source post, and the `telenor-answer-today` homepage
  source page.
- WordPress-managed body content for public pages, policies, articles,
  archives, categories, tags, media, authors, daily quiz tables, and homepage
  FAQs.
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
- Dynamic Karachi visible date that changes at midnight Pakistan time without
  requiring a quiz update.
- Homepage SEO date mode that advances six hours early for metadata, homepage
  WebPage schema, and sitemap freshness.
- Latest-news homepage cards.
- Category, tag, blog, and search archives with pagination.
- Canonical `/<category>/<post>` article routes.
- Related posts, table of contents, breadcrumbs, share buttons, and sidebar.
- End-of-content WordPress author profile on article pages.
- SEO metadata, JSON-LD, robots output, and split XML sitemaps.
- Protected five-question quiz editor.
- On-demand and scheduled cache revalidation.
- Temporary-unavailable pages for repeated WordPress failures.
- Mobile-safe ad containers that collapse empty/unfilled AdSense slots.
- Responsive WordPress tables that scroll horizontally on small screens.

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
getDailyQuizPost()
getHomepageQuizPage()
getPosts({ perPage: 60, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: "news" })
```

`getDailyQuizPost()` explicitly requests the fixed WordPress post slug
`daily-quiz` and uses the `quiz` cache tag. This post is the only source for
homepage quiz cards.

`getHomepageQuizPage()` explicitly requests the fixed WordPress page slug
`telenor-answer-today`. The app uses this page for homepage FAQ parsing and
metadata image fallback only; the static React homepage intro, SEO sections,
and participation steps are not replaced by this WordPress page.

The page parses quiz tables from `daily-quiz`, parses FAQs from
`telenor-answer-today`, calculates the current visible `Asia/Karachi` date, and
renders quiz answers, latest news, static informational sections,
participation steps, ads, FAQs, and the sidebar.

Homepage metadata, homepage WebPage JSON-LD, and the homepage entry in
`/page-sitemap.xml` use a separate SEO date helper that adds six hours before
formatting in `Asia/Karachi`. From `18:00` to `23:59` Pakistan time,
Google-facing metadata can show tomorrow's date while the visible H1 still
shows today's date.

Homepage `FAQPage` JSON-LD uses the same visible FAQ items rendered by
`FaqSection`, capped at six valid question/answer pairs, so structured data
matches what users can see.

Homepage Latest News cards intentionally do not display publication dates.
The first two Latest News cards remain the newest WordPress posts, while the
remaining four are randomly selected client-side from the older lightweight
post pool.

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
  -> load the existing daily-quiz post

POST /api/quiz
  -> validate exactly five questions and four options each
  -> HTML-escape all stored fields
  -> confirm whether daily-quiz exists
  -> create the daily-quiz post once if missing
  -> update the daily-quiz post with PUT after it exists
  -> revalidateTag("quiz")
```

The WordPress existence lookup returns `null` only after a successful empty
array response. Network, rate-limit, server, malformed-JSON, or malformed-data
failures retry once and then return HTTP 503. The save is stopped, preventing
an outage from being mistaken for a missing post.

The quiz admin flow must never write to WordPress pages or to WordPress page
ID `640`. If WordPress shows an old quiz page as "Front Page", fix that in
WordPress Reading Settings or restore the page content there. Quiz saves from
this app are intended to affect only the `daily-quiz` post.

### On-Demand Revalidation

`POST /api/revalidate` is protected by `REVALIDATE_SECRET` in the
`x-revalidate-secret` header. It always revalidates the homepage and sitemap
routes, and it can also revalidate a full production path such as
`/telenor/telenor-packages`.

Preferred WordPress webhook body for nested posts:

```json
{
  "path": "/telenor/telenor-packages"
}
```

If a webhook can only send `category` and `slug`, the app revalidates
`/{category}/{slug}`. If it sends only `slug`, the app keeps the older
`/{slug}` behavior for backward compatibility.

### Daily Date Refresh

`vercel.json` calls `/api/cron/seo-preupdate` at `13:00 UTC`, which is
`18:00` in Karachi. It revalidates `/`, `/page-sitemap.xml`, and
`/sitemap_index.xml` so homepage SEO metadata and sitemap freshness can move
to tomorrow's date six hours early.

`vercel.json` also calls `/api/cron/midnight` at `19:00 UTC`, which is
midnight in Karachi. The endpoint revalidates the same routes; the next
request regenerates the homepage visible H1/content with the new date even
when quiz answers were not edited.

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
  profile URLs, and AdSense loads only outside local development.
- A branded 1200x630 fallback social image is available at
  `public/assets/tele-answer-today-og.webp`.
- Fixed logo, favicon, and homepage participation-step images are served from
  `public/assets/` so they do not depend on the old WordPress uploads path
  after the main domain moves to Vercel.

## 7. Configuration

| Variable | Purpose |
| --- | --- |
| `WORDPRESS_API_URL` | Optional server-side WordPress REST API override |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Backward-compatible URL override |
| `WP_ADMIN_USER` | WordPress API username |
| `WP_ADMIN_PASS` | WordPress application password |
| `ADMIN_SECRET` | Admin login and session-signing secret |
| `REVALIDATE_SECRET` | Protects POST cache revalidation |
| `CRON_SECRET` | Protects scheduled midnight revalidation |

Google Ads/AdSense values are intentionally not environment variables.
Publisher `ca-pub-9444471613078101`, shared slot `4789150646`, and placement
slot mapping are static application configuration in `lib/constants.js`.

Site constants, route sizes, AdSense slots, navigation, colors, local image
paths, and the one-hour revalidation duration are defined in
`lib/constants.js`.

Current local admin defaults for development live in `.env.local`. Production
must set its own `ADMIN_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`,
`WP_ADMIN_USER`, and `WP_ADMIN_PASS` in Vercel.

The app defaults to the canonical Tele Answer WordPress API:
`https://wp.teleanswertoday.pk/wp-json/wp/v2`. Setting `WORDPRESS_API_URL` in
Vercel is still recommended so the backend source is explicit:

```text
WORDPRESS_API_URL=https://wp.teleanswertoday.pk/wp-json/wp/v2
```

The canonical public WordPress API fallback is tracked intentionally so Vercel
builds can complete even if the optional URL env var is not configured yet.
Local secrets live in `.env.local`, which is ignored by Git.

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
publishing partial XML. Homepage `lastmod` follows the six-hour-early SEO date
rollover; post and category sitemap dates remain based on WordPress data.

## 10. Verification Status

Reviewed and updated on June 25, 2026:

| Check | Current result |
| --- | --- |
| Hardcoded backend/API secret scan | Passed: no tracked-source backend URL or secret matches |
| `.env.local` tracking check | Passed: ignored by `.gitignore` and not tracked |
| JavaScript route syntax checks | Covered by lint/build |
| `git diff --check` | Previously passed; current verification focused on lint/test/build |
| Focused TOC behavior simulation | Covered by automated tests and build |
| Admin WordPress lookup simulations | Covered by automated tests |
| `npm.cmd run build` | Passed on June 25, 2026 |
| ESLint | Passed with `npm.cmd run lint` |
| Automated test suite | 36 tests passed with `npm.cmd run test` |

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

- WordPress API configuration supports env overrides and has a canonical public
  Tele Answer fallback for build safety.
- Fixed public assets were moved from WordPress upload URLs into
  `public/assets/`.
- `next.config.js` derives the WordPress media host from `WORDPRESS_API_URL`.
- Tracked source contains no backend secrets, private credentials,
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
- The global AdSense script is loaded from static app configuration in
  `app/layout.jsx` with native `<script async ...>`. This intentionally avoids
  the Next.js `data-nscript` attribute that can trigger AdSense console
  warnings.
- WordPress content must not manage or overwrite Google Ads configuration.
  Publisher IDs, slot IDs, script loading, and `ads.txt` remain controlled by
  the Next.js project.
- Current AdSense configuration uses publisher `ca-pub-9444471613078101`; all
  placement slots currently use `4789150646` for top, mid, in-article,
  sidebar, after-content, and bottom ads.
- Local development intentionally disables the AdSense script and ad units so
  localhost does not generate Google ad-request `403` console noise. Production
  keeps the static publisher and slot IDs.
- Production AdSense can be paused without removing the integration by setting
  `DISABLE_ADSENSE=true`; removing that env value enables ads again.
- `next.config.js` explicitly allows image qualities `60`, `70`, and `75`,
  matching the app's card, featured-image, and fallback image usage.
- Top ad placement loads eagerly; lower, sidebar, and in-article ad placements
  load through an `IntersectionObserver` before the user reaches them.
- Ad placements now use display-friendly `auto` format and placement-specific
  reserved sizes so image-capable ads have enough room to render. The top ad
  keeps a stable reserved area; lower ads still collapse when Google reports an
  unfilled slot.
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
- For better RPM reporting and image/display inventory diagnostics, create
  separate AdSense display ad units for top, mid, in-article, sidebar,
  after-content, and bottom placements. Those future slot IDs should still
  remain static app configuration, not WordPress-managed content.

## Latest Update - 2026-06-25

The current source model is:

- Static homepage intro, informational sections, and participation steps remain
  in React code and are not overwritten by quiz saves.
- Homepage quiz cards read from the WordPress post slug `daily-quiz`.
- Homepage FAQ parsing and metadata image fallback read from the WordPress page
  slug `telenor-answer-today`.
- `/admin/quiz` reads and writes only the `daily-quiz` post. It must not update
  the WordPress Front Page or page ID `640`.

Additional completed fixes:

- Admin session cookies now use a Tele Answer-specific cookie name and protocol
  aware options so local saves do not incorrectly expire the session.
- Empty or unfilled AdSense containers collapse on mobile after client-side
  status detection, preventing large blank spaces below the fixed header.
- Rendered WordPress tables are wrapped with `.wp-table-scroll`, allowing table
  content to scroll horizontally on phones while the page itself stays fixed to
  the viewport width.
- Tests guard the quiz source split, WordPress page safety, ad placeholder
  behavior, content H1 removal, and responsive table wrapping.

## Latest Update - 2026-06-28

Homepage content was expanded and cleaned up using the supplied three-month
Google Search Console keyword data as the primary keyword source. The reference
sites were used only for topic-gap inspiration; no competitor text, images,
tables, headings, or FAQs were copied.

Completed homepage content and SEO/AEO updates:

- Added a `Quick Summary: My Telenor Answer Today` section near the top of the
  homepage for direct-answer search intent.
- Added a `Today's Telenor Quiz Questions and Answers - Quick Guide` section
  after the quiz cards.
- Added original informational sections for quiz categories, PC/app usage, and
  different-question handling.
- Improved grammar and brand consistency for terms such as `My Telenor App`,
  `Telenor Quiz Today`, `Test Your Skills`, and `Play & Win`.
- Updated fallback homepage FAQ wording to better match high-impression Search
  Console queries while keeping the FAQ count capped by existing behavior.
- Added homepage `FAQPage` JSON-LD from the same visible capped FAQ list shown
  to users.
- Updated the homepage TOC so new H2 sections receive stable anchors through
  `homeAnchorId()`.
- Preserved the existing quiz source, admin quiz flow, parser behavior, SEO
  date behavior, metadata/schema generation, ads, Latest News behavior, and
  WordPress API logic.

Public homepage quiz-card presentation was also updated:

- Each quiz card now uses a white rounded container, blue `Question N` header,
  bordered question box, responsive two-column option grid, A/B/C/D markers,
  green correct-answer styling, and a green answer box.
- This was a presentation-only change in `components/home/QuizAnswerCards.jsx`;
  `/admin/quiz`, `daily-quiz`, and parser logic were not changed.

Verification on June 28, 2026:

| Check | Result |
| --- | --- |
| `npm.cmd run test` | Passed: 55 tests |
| `npm.cmd run lint` | Passed |
| `npm.cmd run build` | Passed: 30 routes generated |

Build note: local builds can still print sandbox `EACCES` warnings when the
environment blocks outgoing WordPress fetches. The Next.js production build
completed successfully.
