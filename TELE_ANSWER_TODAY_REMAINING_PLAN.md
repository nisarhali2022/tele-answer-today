# Tele Answer Today Migration Status And Remaining Plan

> Current-state correction, June 25, 2026: the page-source quiz migration
> described below is historical and superseded. The active model is now:
> static React homepage content, quiz cards from the WordPress post
> `daily-quiz`, and homepage FAQ/metadata fallback from the WordPress page
> `telenor-answer-today`. `/admin/quiz` must read and write only the
> `daily-quiz` post and must not update the WordPress Front Page or page ID
> `640`.

## Current Status

The first-priority foundation migration has been completed:

- Git remote is set to `https://github.com/nisarhali2022/tele-answer-today.git`.
- Public site config points to `https://teleanswertoday.pk`.
- WordPress source expectation is `https://wp.teleanswertoday.pk/wp-json/wp/v2`.
- Google Analytics uses `G-Q6NJ8N20FV`.
- Google Search Console verification uses `Umy1DY5Vngn0XLt29V2gpg8Y7unQq6oF4tiW_fhoGnA`.
- Google AdSense client uses `ca-pub-9444471613078101`.
- Ad slots use `4789150646`.
- Public contact/domain references were updated to Tele Answer Today.
- Docs were updated for the new public and WordPress domains.

The homepage source split, quiz parsing, admin save behavior, local Tele
Answer assets, responsive header, live-style submenus, duplicate-H1 SEO fixes,
mobile ad collapse, and responsive WordPress table scroll fixes have now been
implemented. This file remains as a status record plus the remaining
production-deployment checklist.

## Current Active Source Model

- Static homepage intro, informational sections, and participation steps remain
  app-owned React content.
- `daily-quiz` is the only WordPress post updated by `/admin/quiz`.
- `telenor-answer-today` is the homepage page source for FAQ parsing and
  metadata image fallback only.
- `daily-quiz` and `telenor-answer-today` stay excluded from normal public post
  and page listings where appropriate.
- Wide WordPress tables are wrapped in `.wp-table-scroll` by
  `prepareWordPressContent()` for mobile horizontal scrolling.
- Empty or unfilled AdSense slots collapse on mobile so the top ad cannot leave
  a large blank area below the header.

## Superseded Notes

The next sections are retained for history, but any instruction saying that
`/admin/quiz` should update the page `telenor-answer-today` is no longer the
current implementation target.

## Completed Goal

Moved the daily quiz homepage and admin workflow from the old WordPress post slug
`daily-quiz` to the WordPress page slug `telenor-answer-today`, while keeping the
existing Next.js layout, SEO system, ads, and WordPress REST architecture.

The final production model should be:

```text
https://teleanswertoday.pk
  -> Vercel / Next.js public frontend

https://wp.teleanswertoday.pk
  -> WordPress admin, media, and REST API backend
```

## Homepage Page Source

Use the WordPress page for homepage FAQ parsing and metadata image fallback:

```text
telenor-answer-today
```

Expected REST lookup:

```text
GET https://wp.teleanswertoday.pk/wp-json/wp/v2/pages?slug=telenor-answer-today
```

Implemented behavior:

- `getHomepageQuizPage()` fetches the page with embedded author and featured
  media.
- `getDailyQuizPost()` fetches the WordPress post `daily-quiz` and remains the
  active homepage quiz-card source.
- `/admin/quiz` reads and writes only the `daily-quiz` post.
- `telenor-answer-today` is excluded from public page sitemap output so it does not
  appear as `/telenor-answer-today`.
- `daily-quiz` remains excluded from normal post lists because it is a system
  quiz source post.

## Homepage Rendering

The homepage loads:

```text
getDailyQuizPost()
getHomepageQuizPage()
getPosts({ page: 1, perPage: 12, excludeSlugs: EXCLUDED_CONTENT_SLUGS, tag: "news" })
```

The homepage uses the `daily-quiz` WordPress post for:

- Quiz questions.
- Answers.

The homepage uses the `telenor-answer-today` WordPress page for:

- FAQs, where reliably parseable.
- Metadata fallback source.
- Featured image fallback for Open Graph.

Keep the existing static homepage sections:

- Intro text.
- Table of contents.
- Latest news grid.
- Informational sections.
- Participation steps.
- Ads.
- Sidebar.

Homepage title:

```text
Telenor Quiz Today {SEO Karachi Date} - Latest My Telenor Answer Today
```

The SEO Karachi date advances six hours early. From 6:00 PM to 11:59 PM PKT,
metadata/schema/sitemap dates can show tomorrow while the visible H1 still
shows today.

Homepage H1:

```text
My Telenor Answer Today {Karachi Date} - Latest Telenor Quiz Today
```

## Quiz Parser

The parser must support both current and legacy quiz formats.

### Legacy Admin Table Format

Example:

```html
<table>
  <tbody>
    <tr><td>Question 1: Example question?</td></tr>
    <tr><td>- Option A</td></tr>
    <tr><td>- Option B</td></tr>
    <tr><td>- Option C</td></tr>
    <tr><td>- Option D</td></tr>
    <tr><td>Answer -> Option A</td></tr>
  </tbody>
</table>
```

Requirements:

- Do not require questions to end with `?`.
- Accept normal hyphen, en dash, em dash, arrow, colon, and existing encoded
  dash/emoji artifacts where practical.
- Trim and decode HTML entities.
- Return a consistent shape:

```js
{
  question: string,
  options: string[],
  answer: string
}
```

### WordPress Page Numbered Format

Support page content that presents answers as numbered questions and answer
lines, for example:

```text
1. Question text
Option A
Option B
Option C
Option D
Answer: Option A
```

Requirements:

- Detect numbered question starts.
- Collect up to four options before the answer line.
- Stop at the next numbered question.
- Ignore obvious section headings such as Latest News or Today Telenor Answer.

### Missing Or Malformed Content

If no quiz questions can be parsed:

- Do not silently render an empty answer area.
- Show a clear temporary unavailable message in the quiz answer section.
- Keep the rest of the homepage available.

## Admin API

Update `/api/quiz` to target the WordPress page source.

### GET

Current behavior reads:

```text
GET /posts?slug=daily-quiz&per_page=1
```

New behavior should read:

```text
GET /pages?slug=telenor-answer-today&per_page=1
```

Return:

```js
{
  questions,
  date,
  id
}
```

If the page is missing, return an empty quiz with the current Karachi date.
If WordPress is unavailable or returns invalid JSON, return HTTP 503.

### POST

Current behavior creates or updates a post.

New behavior should update the existing page:

```text
PUT /pages/{id}
```

Requirements:

- Keep admin session validation unchanged.
- Keep exactly five questions and four options validation unchanged.
- Keep answer-must-match-option validation unchanged.
- Escape all admin-controlled text before storing HTML.
- Preserve page slug `telenor-answer-today`.
- Use `revalidateTag("quiz")` after a successful save.
- Do not create a new post if the page lookup fails because WordPress is
  unavailable.

## SEO, H1, Header, And Sitemaps

Keep all public SEO output on:

```text
https://teleanswertoday.pk
```

Keep backend/system URLs on:

```text
https://wp.teleanswertoday.pk
```

Required behavior:

- Canonicals use the public root domain.
- WordPress body content is prepared with `prepareWordPressContent()` before
  rendering so stored content H1 tags are removed.
- Templates render exactly one visible page-level H1.
- The global header is fixed and responsive.
- Telenor Packages and Telenor Codes include live-site matching submenus on
  desktop and nested submenu links on mobile.
- `robots.txt` points to `https://teleanswertoday.pk/sitemap_index.xml`.
- Sitemaps keep the homepage as `/`, not `/telenor-answer-today`.
- Article URLs remain `/<category>/<post>`.
- Category URLs remain `/<category>`.
- Author URLs remain `/author/<slug>`.
- Metadata and JSON-LD text must be sanitized.

## Remaining Production Work

- Deploy the current repository to Vercel.
- Confirm Vercel environment variables are set for WordPress, admin secrets,
  AdSense, Analytics, Search Console, revalidation, and cron.
- Verify production URLs:
  `/`, `/privacy-policy`, `/about-us`, `/contact-us`, `/blog`, `/telecom`,
  `/tech`, `/global`, representative articles, `/robots.txt`, and
  `/sitemap_index.xml`.
- Run a live heading audit and confirm every indexable page has exactly one
  H1.
- Validate Schema.org, Google Rich Results, Search Console URL inspection,
  mobile responsiveness, and PageSpeed/Core Web Vitals.

## Documentation Updates

After implementation, update these docs:

- `PROJECT_OVERVIEW.md`
- `PROJECT_STRUCTURE.md`
- `SEO_ANALYSIS.md`
- `BUG_FIXING.md`
- `DEPLOYMENT_DNS_CHECKLIST.md`, only if deployment instructions change

Docs should state:

- Homepage quiz source is the WordPress post `daily-quiz`.
- Homepage FAQ parsing and metadata image fallback source is the WordPress page
  `telenor-answer-today`.
- WordPress API source is `https://wp.teleanswertoday.pk/wp-json/wp/v2`.
- `/admin/quiz` updates only the `daily-quiz` post.

## Acceptance Criteria

The work is complete when:

- Homepage loads quiz content from the WordPress post slug `daily-quiz`.
- Admin GET reads from the `daily-quiz` post.
- Admin POST updates the `daily-quiz` post only.
- The WordPress page slug `telenor-answer-today`, the WordPress Front Page, and
  page ID `640` are not changed by quiz saves.
- Homepage still renders latest news, ads, sidebar, static guidance sections,
  and FAQs.
- No duplicate `/telenor-answer-today` sitemap URL is generated.
- Tests, lint, and build pass.
- No old public-domain current-state references remain outside historical
  context.
