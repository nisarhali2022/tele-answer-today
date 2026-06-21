# Tele Answer Today Remaining Migration Plan

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

The remaining work is intentionally deferred because it changes homepage data flow,
quiz parsing, and admin save behavior.

## Goal

Move the daily quiz homepage and admin workflow from the old WordPress post slug
`daily-quiz` to the WordPress page slug `telenor-answer-today`, while keeping the
existing Next.js layout, SEO system, ads, and WordPress REST architecture.

The final production model should be:

```text
https://teleanswertoday.pk
  -> Vercel / Next.js public frontend

https://wp.teleanswertoday.pk
  -> WordPress admin, media, and REST API backend
```

## Homepage Source

Use the WordPress page:

```text
telenor-answer-today
```

Expected REST lookup:

```text
GET https://wp.teleanswertoday.pk/wp-json/wp/v2/pages?slug=telenor-answer-today
```

Required implementation behavior:

- Add a dedicated helper such as `getHomepageQuizPage()`.
- Fetch the page with embedded author and featured media.
- Cache it with the same `quiz` cache tag used by the current homepage.
- Keep `getDailyQuizPost()` only if compatibility is useful, but avoid making
  new homepage code read like it still depends on the old post.
- Exclude `telenor-answer-today` from public page sitemap output so it does not
  appear as `/telenor-answer-today`.
- Continue excluding `daily-quiz` from normal post lists during transition.

## Homepage Rendering

Update the homepage to load:

```text
getHomepageQuizPage()
getPosts({ page: 1, perPage: 12, excludeSlugs: ["daily-quiz"], tag: "news" })
```

The homepage should use the WordPress page content for:

- Quiz questions.
- Answers.
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
Telenor Quiz Today {Karachi Date} - Latest My Telenor Answers
```

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

## SEO And Sitemaps

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
- `robots.txt` points to `https://teleanswertoday.pk/sitemap_index.xml`.
- Sitemaps keep the homepage as `/`, not `/telenor-answer-today`.
- Article URLs remain `/<category>/<post>`.
- Category URLs remain `/<category>`.
- Author URLs remain `/author/<slug>`.
- Metadata and JSON-LD text must be sanitized.

## Documentation Updates

After implementation, update these docs:

- `PROJECT_OVERVIEW.md`
- `PROJECT_STRUCTURE.md`
- `SEO_ANALYSIS.md`
- `BUG_FIXING.md`
- `DEPLOYMENT_DNS_CHECKLIST.md`, only if deployment instructions change

Docs should state:

- Homepage source is `telenor-answer-today`.
- WordPress API source is `https://wp.teleanswertoday.pk/wp-json/wp/v2`.
- The old `daily-quiz` post is no longer the active homepage source.

## Acceptance Criteria

The work is complete when:

- Homepage loads quiz content from the WordPress page slug
  `telenor-answer-today`.
- Admin GET reads from that page.
- Admin POST updates that page.
- Homepage still renders latest news, ads, sidebar, static guidance sections,
  and FAQs.
- No duplicate `/telenor-answer-today` sitemap URL is generated.
- Tests, lint, and build pass.
- No old public-domain current-state references remain outside historical
  context.
