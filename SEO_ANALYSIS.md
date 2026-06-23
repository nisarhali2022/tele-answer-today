# Detailed SEO Analysis

## 1. Audit Scope

Audit date: June 19, 2026.

This review covers:

- Next.js metadata and canonical generation.
- Live production URL behavior.
- Indexing, robots, and XML sitemaps.
- Heading hierarchy and rendered content.
- Article, breadcrumb, and site structured data.
- Archive pagination and duplicate-content handling.
- Internal links and route consistency.
- Images, Open Graph, Twitter cards, local fixed assets, and Core Web Vitals
  risks.
- Content quality, topical structure, authorship, and trust signals.

The repository and live production site are not currently identical. Findings
are therefore labeled as:

- **Live:** confirmed in the production browser response.
- **Code:** confirmed in the repository.
- **Parity:** caused by a difference between production and this repository.

## 2. Executive Summary

Latest update: June 22, 2026.

The project has a useful SEO foundation:

- Canonical routes exist for posts and categories.
- Incorrect post category prefixes permanently redirect.
- Search pages are marked `noindex`.
- Sitemaps are split by content type.
- Breadcrumb and article JSON-LD are present.
- WordPress images use `next/image` in application-owned components.
- The homepage explicitly loads the `telenor-answer-today` WordPress page.
- Article author information is displayed.
- The intended deployment model separates the public Vercel frontend from the
  Hostinger WordPress backend on a `wp.` subdomain.
- Fixed logo/favicon/homepage instructional images are local public assets.
- The WordPress backend/API URL has a canonical public fallback and can be
  overridden through Vercel environment variables.
- WordPress body content is passed through `prepareWordPressContent()`, which
  removes embedded content H1 blocks before rendering. Templates keep exactly
  one visible page-level H1.
- The main header is fixed, responsive, and includes live-site matching
  submenus for Telenor Packages and Telenor Codes.
- Metadata title/description generation now sanitizes WordPress/backend and
  legacy public-domain references before producing canonical, Open Graph, and
  Twitter metadata.
- WordPress list queries now fetch compact list fields instead of full post
  bodies, reducing hidden server-rendered payload size and preventing stale
  body links from appearing in archive/sidebar payloads.

However, several issues can prevent correct indexing or weaken search
performance.

### Priority totals

| Priority | Count | Meaning |
| --- | ---: | --- |
| Critical | 3 | Can remove or consolidate important URLs from search |
| High | 8 | Strong indexing, metadata, or page-quality impact |
| Medium | 13 | Material optimization and crawl-quality opportunity |
| Low | 8 | Cleanup and consistency improvements |

## 3. Critical Issues

### SEO-01: Live category and article URLs redirect to `/blog/`

**Source:** Live

**Status:** Requires production verification after deployment. The repository
route implementation is correct, but the earlier live audit observed the
redirect.

The following representative production URLs resolved to `/blog/` during the
audit:

```text
/tech/
/tech/samsung-just-made-6g-networks-possible/
```

The resulting page used:

```text
Title: Blog | Telenor Quiz Today
Canonical: https://teleanswertoday.pk/blog/
```

**Impact:**

- Category and article URLs cannot retain their own rankings.
- Google may remove the original URLs and consolidate signals into `/blog/`.
- Sitemap URLs can disagree with crawler-visible destinations.
- Internal links lead users and crawlers to the wrong page.

**Required fix:**

1. Inspect WordPress redirect plugins, server redirects, Vercel routing, and
   deployment configuration.
2. Remove catch-all redirects that send valid categories/posts to `/blog/`.
3. Confirm each article returns its own content and canonical.
4. Confirm categories return archive content rather than the blog page.
5. Revalidate or resubmit the corrected sitemap in Google Search Console.

**Validation:**

```text
GET /tech/                                      -> 200, canonical /tech/
GET /tech/<valid-post>/                         -> 200, canonical same URL
GET /wrong-category/<valid-post>/               -> 308 to canonical category
```

### SEO-02: Article pages do not render the article title as an `<h1>`

**Source:** Code

**Status:** Resolved on June 14, 2026.

`app/[slug]/[post_slug]/page.jsx` renders breadcrumbs, metadata, the featured
image, TOC, and content, but it never renders `post.title.rendered`.

**Impact:**

- The main page topic is absent from the visible document structure.
- The first heading may be an arbitrary WordPress `h2`.
- Accessibility and search-engine content interpretation are weakened.
- Users do not see the article title after opening a card.

**Implemented result:** Article pages now render one plain-text WordPress post
title as the page-level H1 before `PostMeta`.

The implemented pattern is equivalent to:

```jsx
<h1>{stripHtml(post.title.rendered)}</h1>
```

Keep exactly one page-level H1.

### SEO-03: The fallback Open Graph image does not exist

**Source:** Code

**Status:** Resolved on June 14, 2026.

`SITE_CONFIG.defaultOgImage` is `/assets/tele-answer-today-og.webp`, but `public/` contains no
matching file. This URL is used by the root layout, homepage, blog, category,
tag, post, and generic page metadata when no featured image is available.

**Impact:**

- Social previews can show no image or an error.
- Link click-through rate can fall.
- Metadata validators report a broken asset.

**Implemented result:** A branded, optimized 1200x630 JPEG now exists at:

```text
public/assets/tele-answer-today-og.webp
```

## 4. High-Priority Issues

### SEO-04: Paginated archives canonicalize every page to page 1

**Source:** Code

**Status:** Resolved on June 15, 2026.

Blog, category, and tag metadata ignore `searchParams.page`. For example:

```text
/blog?page=2       canonical -> /blog
/tech?page=2       canonical -> /tech
/tag/example?page=2 canonical -> /tag/example
```

**Impact:**

- Older archive pages may be treated as duplicates.
- Posts available only on later pages can receive weaker discovery signals.
- Google may ignore page 2+ content.

**Fix:** Use self-referencing canonicals:

```text
/blog?page=2 -> canonical /blog?page=2
```

Validate the page number and return 404 for values below 1 or above the last
available page.

**Implemented result:** Blog, category, and tag metadata pass the validated
page number through `buildMetadata()`. `canonicalPath()` adds `?page=N` for
page 2+, and invalid/out-of-range pages return the custom 404 response.

### SEO-05: Generated titles can repeat the site name

**Status:** Resolved on June 14, 2026.

**Source:** Code

The root layout defines:

```js
title: {
  template: `%s | ${SITE_CONFIG.name}`
}
```

Many routes already return titles such as:

```text
Blog | Telenor Quiz Today
Tech Archives | Telenor Quiz Today
Post Title | Telenor Quiz Today
```

The template can produce:

```text
Blog | Telenor Quiz Today | Telenor Quiz Today
```

**Fix:** Route metadata should return only the page-specific portion:

```text
Blog
Tech Archives
Post Title
```

Allow the root template to append the brand once. Preserve complete external
Yoast titles with `title.absolute` when appropriate.

**Implemented result:** Route-generated titles now contain only the
page-specific title. Complete Yoast titles use an absolute title so the root
template does not append the brand a second time.

### SEO-06: Generic WordPress pages also omit a visible H1

**Source:** Code

**Status:** Resolved on June 14, 2026.

The WordPress-page branch of `app/[slug]/page.jsx` renders `PostMeta`,
featured image, TOC, and content without rendering `page.title.rendered`.

**Impact:** The same heading-hierarchy problem as SEO-02 affects dynamically
resolved WordPress pages.

**Implemented result:** The dynamic WordPress-page branch now renders the
plain-text WordPress page title as one H1 before page metadata and content.

### SEO-06A: WordPress page content can create duplicate H1 tags

**Source:** Code

**Status:** Resolved on June 22, 2026.

Some WordPress-backed pages, including Privacy Policy, can store an H1 inside
`page.content.rendered`. The Next.js page template also renders the WordPress
title as the visible page-level H1. This produced two H1 tags on affected
pages:

```text
<h1>Privacy Policy</h1>
<h1>Privacy Policy</h1>
```

**Impact:**

- Heading-outline tools report duplicate H1s.
- Search engines and assistive technology receive a weaker page hierarchy.
- The page title appears twice visually or semantically when WordPress content
  includes a manual H1.

**Implemented result:** `lib/utils.js` now exposes
`prepareWordPressContent()`, which removes WordPress body H1 blocks before
link rewriting and image optimization. These routes use the helper:

```text
app/privacy-policy/page.jsx
app/about-us/page.jsx
app/[slug]/page.jsx
app/[slug]/[post_slug]/page.jsx
```

Rendered verification on June 22, 2026 confirmed one H1 on:

```text
/
/privacy-policy
/about-us
/contact-us
/blog
/telecom
/tech
/global
/telenor/telenor-packages
```

### SEO-07: Repository routes conflict with existing WordPress page slugs

**Status:** Resolved on June 14, 2026.

**Source:** Code + Live

The repository links to and fetches:

```text
/about   -> WordPress slug "about"
/contact -> WordPress slug "contact"
```

The live site exposes:

```text
/about-us/
/contact-us/
```

The previously supplied page sitemap also used `/contact-us/`.

**Impact:**

- Header/footer links may return 404 after deployment.
- Duplicate versions may exist through the generic `[slug]` route.
- Sitemap, internal links, and canonicals can disagree.

**Fix:** Choose one permanent slug for each page. Recommended:

```text
/about-us/
/contact-us/
```

Update fetch slugs, route links, metadata canonicals, sitemap output, and
redirect old variants permanently.

**Implemented result:** `/about-us` and `/contact-us` are the canonical public
routes. Header/footer links and WordPress lookups use those slugs, while
`/about` and `/contact` issue permanent redirects.

### SEO-08: Sitemap failures are silently converted into empty/partial maps

**Status:** Resolved on June 15, 2026.

**Implemented result:** Sitemap collection now uses the shared WordPress
retry/error layer. A failed page aborts generation instead of publishing a
partial map, while responses retain stale-while-revalidate caching.

**Source:** Code

`lib/sitemap.js` catches fetch failures and breaks pagination without logging
or throwing. Non-OK responses also stop silently.

**Impact:**

- A temporary WordPress failure can publish an incomplete sitemap.
- Search engines can interpret missing URLs as removed content.
- Operators receive no useful alert.

**Fix:** Reuse the structured WordPress retry/error policy. Prefer serving the
last cached complete sitemap over generating an empty or partial one.

### SEO-09: Production and repository metadata/schema are not in parity

**Source:** Parity

**Status:** Requires production deployment verification.

The live homepage exposed:

```text
lang="en-US"
Yoast-generated Article schema
WordPress-style metadata
```

The repository would emit:

```text
lang="en"
custom Next.js metadata
no homepage Article schema
```

**Impact:** SEO fixes in the repository may not affect production, and live
behavior cannot be reliably predicted from source review.

**Fix:** Confirm the active production deployment, DNS origin, reverse proxy,
and WordPress/Next.js ownership. Establish one authoritative rendering layer:

```text
teleanswertoday.pk -> Vercel / Next.js frontend
wp.teleanswertoday.pk -> Hostinger / WordPress admin and REST API
```

Keep the `wp.` subdomain and Hostinger WordPress database/files active. Do not
delete the Hostinger WordPress backend when moving the root domain DNS to
Vercel.

### SEO-10: Archive and tag pages can be thin

**Status:** Resolved on June 14, 2026.

**Source:** Code

Category pages display a description only when WordPress provides one. Tag
pages display only a heading and post count. The blog page has one generic
sentence.

**Impact:**

- Weak topical context.
- Low differentiation between archives.
- Tag archives can become low-value indexable pages.

**Fix:**

- Add unique category introductions, entities, and internal links.
- Add useful tag descriptions or mark low-value tag archives `noindex`.
- Keep only strategically useful taxonomy pages indexable.

**Implemented result:** Category archives use WordPress descriptions when
available and useful category-specific fallback introductions otherwise. Tag
archives display a description and are consistently `noindex, follow`.

### SEO-11: Article structured data is incomplete and uses unsanitized titles

**Status:** Resolved on June 15, 2026.

**Implemented result:** Article schema now includes a sanitized headline and
description, canonical main entity, image, publisher identity/logo, language,
dates, and crawlable author profile URL.

**Source:** Code

Article JSON-LD currently contains:

- `headline`
- dates
- basic author
- basic publisher

It omits:

- `mainEntityOfPage`
- `image`
- publisher logo
- description
- author URL/profile

`headline` uses raw `post.title.rendered`, which can contain HTML entities or
markup.

**Fix:** Strip HTML and add complete Article fields using canonical URLs,
featured-image data, publisher logo, and author identity.

## 5. Medium-Priority Issues

### SEO-12: Canonical slash style is inconsistent

**Status:** Resolved on June 14, 2026.

**Source:** Code

Sitemaps output trailing slashes, while metadata canonicals generally do not.

**Fix:** Choose one URL convention and enforce it through Next.js redirects,
internal links, canonicals, and sitemaps.

**Implemented result:** The application explicitly uses no trailing slash for
non-root URLs. Canonical helpers and all XML sitemap URL entries follow the
same convention.

### SEO-13: Homepage metadata date intentionally advances before visible H1

**Status:** Implemented intentionally on June 23, 2026.

**Source:** Code

The H1 contains the current visible Karachi date. Homepage metadata uses a
separate SEO freshness date that adds six hours before formatting in Karachi
time.

**Impact:** From 6:00 PM to 11:59 PM PKT, search-facing metadata can show
tomorrow's date while the visible page still shows today's date. This is a
deliberate homepage-only SEO freshness strategy.

**Fix:** Keep visible content on the normal Karachi date, and generate
homepage metadata, Open Graph, Twitter metadata, and homepage WebPage JSON-LD
from the six-hour-early SEO date helper.

**Implemented result:** Homepage visible H1/content uses
`getKarachiDateLabel()`. Homepage title, description, Open Graph, Twitter
metadata, and WebPage `dateModified` use `getKarachiSeoDateLabel()` or
`getKarachiSeoDayStartISO()`.

### SEO-14: Homepage sitemap `lastmod` does not reflect midnight date changes

**Status:** Resolved on June 15, 2026.

**Implemented result:** Homepage sitemap `lastmod` uses the start of the
six-hour-early SEO Karachi date. `/sitemap_index.xml` inherits the newer page
sitemap `lastmod`.

**Source:** Code

The homepage visibly changes its date each midnight, but sitemap `lastmod`
uses the quiz post modification date or a WordPress page modification date.

**Fix:** Update homepage `lastmod` from the same six-hour-early SEO date helper
used for homepage metadata. Keep post and category sitemap dates based on
WordPress data.

### SEO-15: Breadcrumb JSON-LD omits the final item URL

**Status:** Resolved on June 14, 2026.

**Source:** Code

Only breadcrumb entries with `href` receive an `item` URL. The final current
page has no `item`.

**Fix:** Pass the canonical path for every breadcrumb item, including the
current page, and include the absolute URL in JSON-LD.

**Implemented result:** Every breadcrumb schema item now has an absolute URL,
including the current page and its pagination/search parameters.

### SEO-16: No site-level Organization or WebSite schema in Next.js output

**Status:** Resolved on June 15, 2026.

**Implemented result:** The root layout emits a linked Organization/WebSite
graph with stable IDs, canonical URL, language, description, publisher, and
logo. It does not add speculative social profiles or a SearchAction.

**Source:** Code

The repository emits Article and Breadcrumb schemas, but no central
Organization/WebSite identity graph.

**Fix:** Add stable site-level JSON-LD in the root layout with:

- Organization name and canonical URL.
- Real logo URL and dimensions.
- Real social profiles only.
- WebSite name, URL, and language.

Do not add a SearchAction unless the search URL and behavior are reliable.

### SEO-17: Author identity lacks a crawlable profile URL

**Status:** Resolved on June 15, 2026.

**Implemented result:** `/author/[slug]` renders the WordPress author name,
bio, avatar, Person schema, and paginated article list. Article schema,
bylines, author boxes, and the page sitemap link to these profiles.

**Source:** Code

The author box shows a name, description, and avatar, but there is no author
route or schema URL tying articles to an author entity.

**Fix:** Add author profile pages or a stable author anchor/URL containing bio,
expertise, editorial role, and article list. Reference that URL from Article
schema.

### SEO-18: Open Graph/Twitter metadata is inconsistent by route

**Status:** Resolved on June 14, 2026.

**Source:** Code

Some routes define Open Graph but not Twitter fields. Static pages do not
always define images. Dynamic images omit explicit width/height.

**Fix:** Create a shared metadata builder covering:

- canonical
- title/description
- Open Graph URL/type/image dimensions
- Twitter card/title/description/image
- robots policy

**Implemented result:** `lib/seo.js` now builds route metadata with consistent
canonicals, Open Graph fields, Twitter cards, images, article dates, title
handling, and optional robots policy.

### SEO-19: WordPress REST payloads are larger than necessary

**Status:** Resolved on June 15, 2026.

**Implemented result:** Post, page, taxonomy, related-post, author, and
sitemap requests use endpoint-specific `_fields` and selective `_embed`
values.

**Source:** Code

Many requests use `_embed=true` without `_fields`, returning large post
objects.

**Impact:** Slower server rendering, higher origin load, and weaker TTFB.

**Fix:** Define endpoint-specific `_fields` lists while retaining required
embedded media, terms, and authors.

### SEO-20: Popular-post calculation is expensive

**Status:** Resolved for the current implementation on June 15, 2026.

**Implemented result:** The calculation samples 50 recent comments instead of
100, caches for one hour instead of five minutes, and reuses the sidebar's
already-fetched latest posts for fallback results.

**Source:** Code

The sidebar fetches up to 100 comments and then another posts request. It is
cached for five minutes but still affects origin load and regeneration time.

**Fix:** Precompute popular post IDs, use a WordPress endpoint/plugin designed
for popularity, or refresh the ranking less frequently.

### SEO-21: Root footer data can delay the entire response

**Status:** Resolved on June 15, 2026.

**Implemented result:** The footer is now fully static requested copy and no
longer performs any WordPress request from the root layout. Earlier Suspense
streaming was replaced by the simpler static footer.

**Source:** Code

Earlier versions rendered an async footer in the root layout and fetched
recent posts.

**Fix:** Wrap the footer data section in Suspense, cache it for longer, or
remove dynamic recent posts from the global layout. The current implementation
uses the last option.

### SEO-22: Homepage image priority is over-specified

**Status:** Resolved on June 15, 2026.

**Implemented result:** The custom Latest News preload component and Latest
News `priority` flags were removed. The above-the-fold logo is the only
homepage image preload observed.

**Source:** Code

The header logo uses `priority`. The first Latest News image also uses
`priority`, and `LCPPreloader` injects another preload for that same image.

**Impact:** Competing high-priority resources can reduce LCP performance.

**Fix:** Measure the actual LCP element and use one preload mechanism for that
resource only.

### SEO-23: WordPress body images are not optimized by application code

**Status:** Resolved on June 15, 2026.

**Implemented result:** Existing WordPress dimensions, `srcset`, and `sizes`
are preserved. Missing dimensions are inferred from WordPress filenames or
receive a stable fallback. Images without `srcset` receive supported Next.js
optimizer candidates and a responsive `sizes` value. Missing lazy-loading and
asynchronous-decoding attributes are also added.

**Source:** Code

Images inside `dangerouslySetInnerHTML` bypass `next/image`. Their loading,
dimensions, decoding, and responsive sources depend entirely on WordPress
markup.

**Fix:** Ensure WordPress always supplies width, height, `srcset`, and `sizes`.
Post-process non-critical body images with `loading="lazy"` and
`decoding="async"` where safe.

### SEO-24: Image alt text can contain raw WordPress HTML/entities

**Source:** Code

**Status:** Resolved on June 14, 2026.

Fallback alt text can use `post.title.rendered` directly. Recent-post image alt
text also uses the rendered title.

**Implemented result:** `getFeaturedImageAlt()` now strips HTML and decodes
entities. Featured images, homepage Latest News, and sidebar Recent Posts use
that shared sanitized alt-text helper.

### SEO-25: Invalid archive page numbers do not become clean 404 responses

**Status:** Resolved on June 14, 2026.

**Source:** Code

Page numbers are converted with `Number(...)`, but there is no explicit range
validation. WordPress errors for excessive pages can become temporary API
errors rather than a not-found response.

**Fix:** Reject non-integers and values below 1. Return 404 when
`currentPage > totalPages`.

**Implemented result:** Blog, category, tag, and search routes reject
non-integer, zero, negative, and out-of-range page values with `notFound()`.
WordPress invalid-page 400 responses are normalized into the same 404 path.

### SEO-26: Social profile links are placeholders

**Source:** Code

**Status:** Partially resolved; awaiting real profile URLs.

Footer links point to generic destinations:

```text
https://facebook.com
https://twitter.com
https://wa.me/
```

**Impact:** Weak trust signals and poor user experience.

**Implemented result:** Generic text/profile links were removed from the footer
bottom row. A social icon row now exists for Facebook, LinkedIn, YouTube,
Twitter/X, Instagram, and Pinterest, but the icon links currently use `#`
placeholders. Add verified profile URLs before using them in Organization
schema.

## 6. Low-Priority Issues

### SEO-27: HTML language should be specific and consistent

**Source:** Code + Live

**Status:** Resolved in the repository on June 14, 2026.

Repository: `lang="en"`. Live: `lang="en-US"`. Primary audience and locale are
Pakistan.

**Implemented result:** The Next.js root document now uses `lang="en-PK"`.
Production still requires deployment/parity verification.

### SEO-28: Next.js metadata `link` resource hints are not reliable

**Source:** Code

**Status:** Resolved on June 14, 2026.

The root metadata object contains a `link` array for Google Fonts. The project
uses `next/font`, which self-hosts fonts, and resource hints should not be
defined through an unsupported metadata field.

**Implemented result:** The obsolete font preconnect entries were removed.
The site continues to use `next/font`.

### SEO-29: Placeholder AdSense script is loaded globally

**Source:** Code

**Status:** Resolved on June 14, 2026.

The client ID is `ca-pub-XXXXXXXXXXXXXXXXX`, but the layout still renders the
AdSense script URL.

**Implemented result:** The root layout loads AdSense only when the configured
publisher ID is non-empty and does not contain the placeholder `XXXX`.

### SEO-35: Hardcoded WordPress backend URL can expose migration internals

**Source:** Code

**Status:** Resolved on June 19, 2026.

**Problem:** A hardcoded WordPress API fallback in tracked source can cause
accidental configuration drift between local, preview, and production
environments.

**Implemented result:** The project now intentionally defaults to the
canonical public Tele Answer WordPress REST API so Vercel builds can complete
even before optional env setup. `WORDPRESS_API_URL` remains the recommended
production override, and the WordPress media host in `next.config.js` is
derived from the resolved API URL.

### SEO-36: Static images depended on the old main-domain WordPress uploads URL

**Source:** Code

**Status:** Resolved on June 19, 2026.

**Problem:** Logo, favicon, and homepage participation-step images used
`teleanswertoday.pk/wp-content/uploads/...`. After the root domain moves
to Vercel, those URLs may no longer be served by Hostinger.

**Implemented result:** These fixed assets now live in `public/assets/` and
are referenced through local `/assets/...` paths. Dynamic WordPress post media
continues to use the WordPress backend media host from environment
configuration.

### SEO-30: Sitemap image extraction is incomplete

**Status:** Resolved on June 15, 2026.

**Implemented result:** Sitemap images prioritize embedded featured media and
also recognize normal/lazy source attributes and the largest usable srcset
candidate.

**Source:** Code

The sitemap parser reads only `<img src>`. It does not account for lazy-image
attributes or additional `srcset` candidates.

**Fix:** Prefer WordPress media data and intentionally select the canonical
image URL rather than scraping HTML only.

### SEO-31: Sitemap does not include tag archives

**Status:** Resolved by policy on June 14, 2026.

**Source:** Code

Tag routes are indexable but absent from the sitemap.

**Fix:** Either:

- add only valuable, described tag pages to a tag sitemap, or
- mark all low-value tag archives `noindex`.

Do not indiscriminately index every tag.

**Implemented result:** All tag archives now explicitly use `noindex, follow`,
so intentionally omitting them from the sitemap is consistent with the
indexing policy.

### SEO-32: Metadata text can contain rendered HTML or entities

**Status:** Resolved on June 15, 2026.

**Implemented result:** Metadata, Article/Person/breadcrumb schema, author
names, WordPress page titles/descriptions, and image alt fallbacks use one
HTML-stripping and entity-decoding plain-text helper.

**Source:** Code

Post/page fallback titles sometimes use `.rendered` directly.

**Fix:** Apply a shared plain-text decoder to all fallback titles,
descriptions, alt text, and structured-data names.

### SEO-33: Search pages should explicitly use `follow: true`

**Source:** Code

**Status:** Resolved on June 14, 2026.

Search metadata sets only `index: false`.

**Implemented result:** Search metadata now uses:

```js
robots: { index: false, follow: true }
```

This makes the intended policy explicit.

### SEO-34: Missing editorial trust pages and policies in application links

**Status:** Resolved on June 14, 2026.

**Source:** Code + Live

The live site exposes Terms and Disclaimer pages, but repository navigation
does not link them. There is no obvious editorial policy, corrections policy,
or sourcing policy.

**Fix:** Add accessible trust pages and link them from the footer:

- About/editorial team.
- Contact.
- Editorial and corrections policy.
- Sources/methodology for quiz answers.
- Terms, privacy, and disclaimer.

**Implemented result:** The footer links About, Contact, Privacy, Terms,
Disclaimer, Editorial Policy, and Corrections Policy. New editorial and
corrections pages explain review and correction practices and are included in
the page sitemap.

## 7. Content and Topical SEO Analysis

### Homepage

Strengths:

- Daily intent is clear.
- The current date appears in the H1.
- Quiz answers are immediately available.
- Supporting sections cover participation and troubleshooting.

Improvements:

- Rewrite awkward phrases such as “inside the today My Telenor app question
  answer.”
- Reduce repeated exact-match phrases.
- Avoid unsupported claims such as real-time tracking unless the process
  genuinely supports them.
- State when and how answers are verified.
- Add a visible “last checked” time only when it is accurate.
- Link to relevant Telenor package/code guides contextually.

### News Articles

Improvements:

- Add a visible H1.
- Include original reporting, analysis, citations, and named sources.
- Avoid publishing rewritten news with little unique value.
- Add author expertise and editorial review information.
- Use descriptive internal links to related telecom/technology explainers.
- Update material changes and retain accurate `dateModified`.

### Category Pages

Improvements:

- Add 150-300 words of unique, useful category copy.
- Explain the category scope and major subtopics.
- Link to cornerstone guides.
- Avoid category titles that contain only “Archives.”

### Tags

Tags should be curated. Index only tags that:

- Have multiple high-quality posts.
- Have a unique description.
- Represent genuine search intent.
- Are linked internally.

Noindex or remove one-post, duplicate, or near-synonymous tags.

## 8. Recommended Implementation Order

### Completed easy fixes

- SEO-02: article H1.
- SEO-03: fallback Open Graph image.
- SEO-06: dynamic WordPress page H1.
- SEO-24: sanitized image alt text.
- SEO-26: placeholder social profile removal.
- SEO-27: `en-PK` document language.
- SEO-28: obsolete preconnect removal.
- SEO-29: conditional AdSense script.
- SEO-33: explicit `noindex, follow` for search.

SEO-32 was completed with the complex metadata/schema work on June 15, 2026.

### Phase 1: Indexing protection

1. Verify live category/article URLs no longer redirect to `/blog/`.
2. Confirm production is serving this Next.js repository.
3. About/Contact slug alignment is completed.
4. Self-referencing paginated canonicals are completed.

### Phase 2: Metadata and schema

1. Remove duplicate brand suffixes from route titles.
2. Sanitize all metadata and schema text.
3. Expand Article schema.
4. Add Organization and WebSite schema.
5. Standardize Open Graph/Twitter metadata.
6. Standardize trailing-slash policy.

### Phase 3: Crawl and archive quality

1. Make sitemap generation resilient.
2. Validate archive page numbers.
3. Decide which tags should be indexed.
4. Add unique category/tag copy.
5. Align homepage `lastmod` with real content changes.

### Phase 4: Performance and trust

1. Reduce WordPress payloads. Completed.
2. Simplify popular-post calculation. Completed.
3. Prevent footer data from blocking the root layout. Completed; footer is now
   static.
4. Measure and correct image preload priorities. Completed.
5. Optimize WordPress body images. Completed.
6. Replace footer social icon placeholders with real social profile URLs.
7. Add/expand sourcing methodology where relevant.

### Phase 5: Headless deployment readiness

1. Keep public canonicals, sitemaps, schema, and sharing URLs on
   `https://teleanswertoday.pk`.
2. Keep WordPress backend/admin/API on the Hostinger `wp.` subdomain.
3. Add `WORDPRESS_API_URL` in Vercel before production deployment.
4. Keep `wp.` DNS pointing to Hostinger while the root and `www` DNS records
   point to Vercel.
5. Serve `robots.txt` with `Disallow: /` on the `wp.` backend subdomain, while
   allowing indexing on the public Next.js root domain.

## 9. Necessary Remaining SEO Work

1. **SEO-01 deployment check:** Verify representative category and article
   URLs return HTTP 200 with self-canonicals after the updated application is
   deployed.
2. **SEO-09 deployment check:** Confirm the production domain serves this
   repository's metadata, schema, sitemap, language, and routing output.
3. Replace footer social icon `#` placeholders with real verified social URLs
   or remove icons until profile URLs are available.
4. Measure field Core Web Vitals after deployment; build bundle sizes alone
   do not confirm real-user LCP, INP, or CLS.
5. Re-run a production heading audit after deployment and confirm every
   indexable page reports exactly one H1.

## 10. Validation Checklist

After fixes:

- Every important URL returns its intended content.
- Valid categories and posts do not redirect to `/blog/`.
- Every indexable page has one visible H1.
- WordPress body content does not render stored H1 blocks below the template
  H1.
- Titles contain the site name no more than once.
- Canonicals match the exact preferred URL.
- Page 2+ archives self-canonicalize.
- Invalid pagination returns 404.
- The fallback OG image returns HTTP 200 and is 1200x630.
- Article schema passes Schema.org and Google rich-result validation.
- Breadcrumb schema uses canonical item URLs.
- Sitemap generation survives temporary WordPress failures.
- Sitemaps contain only canonical, indexable, HTTP 200 URLs.
- Search and admin pages are `noindex`.
- Language, Open Graph locale, and visible audience targeting agree.
- Core Web Vitals are measured on homepage, archive, and article templates.
- The public root domain points to Vercel.
- The WordPress `wp.` subdomain remains available on Hostinger.
- The `wp.` backend subdomain is blocked from indexing, while the public root
  domain is indexable.
- Vercel has `WORDPRESS_API_URL` configured.
- Search Console coverage, canonical, crawl, and enhancement reports are
  reviewed after deployment.

## 11. Current Verification Limitations

- The June 22, 2026 production build compiled, type-checked, and generated all
  29 routes successfully.
- `npm.cmd run test` passed 22 tests, `npm.cmd run lint` passed, and a
  tracked-source scan found no backend WordPress URL, WordPress API path, old
  main-domain upload path, or hardcoded secret/password matches.
- Local browser and HTTP checks verified site, Article, Person, breadcrumb,
  author-route, and sitemap output.
- No Search Console, Analytics, backlink, keyword, or field Core Web Vitals
  data was available.
- Live production and repository output differ, so deployment parity must be
  resolved before treating source changes as live SEO fixes.

## 12. Latest SEO and Monetization Update - 2026-06-20

Completed SEO-related changes:

- `/sitemap_index.xml` is the preferred sitemap for Search Console.
- `/sitemap.xml` now redirects to `/sitemap_index.xml` so users and crawlers do
  not hit a 404 when checking the common sitemap URL.
- `robots.txt` allows public crawl access, blocks `/api/`, and points to the
  sitemap index.
- Google Search Console verification is included statically in root metadata.
- Google Analytics is included statically through the root layout.
- `ads.txt` is static and authorized for the AdSense publisher account.
- Backend WordPress domain text is normalized out of public page content so
  users and crawlers see the public root domain instead of `wp.` URLs.
- Contact and About pages now use public-facing layouts and cleaner content
  presentation.
- Mobile horizontal overflow was fixed, improving mobile usability and reducing
  layout instability risk.
- Table of contents remains collapsed on initial load to reduce first-load page
  height and visual noise.

Performance and Core Web Vitals status:

- Latest PageSpeed screenshot showed strong SEO and accessibility scores, with
  remaining performance pressure mainly from third-party ad scripts, CSS render
  blocking, and JavaScript work.
- AdSense now loads globally with `lazyOnload`.
- The first/top ad placement loads eagerly for better monetization opportunity.
- Lower placements load before scroll arrival using a generous viewport margin,
  balancing RPM and page speed.
- Reserved ad container height is kept to reduce CLS.

Remaining SEO/performance recommendations:

1. Re-run PageSpeed on the live Vercel domain after deployment and after ads
   have had time to fill.
2. Check Search Console sitemap details for discovered URL count and indexing
   errors.
3. Create separate AdSense ad units per placement for better RPM diagnostics.
4. Monitor whether ad loading changes affect LCP, INP, and CLS in real Chrome
   User Experience data.
5. Keep the WordPress `wp.` subdomain blocked from indexing while allowing REST
   API and media access for the Vercel frontend.
