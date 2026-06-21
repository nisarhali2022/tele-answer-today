# Tele Answer Today Implementation Checklist

Use this checklist for the remaining migration after the first-priority config
work.

## 1. Constants And Shared Slugs

- [ ] Add `HOME_PAGE_SLUG = 'telenor-answer-today'` in `lib/constants.js`.
- [ ] Add `EXCLUDED_CONTENT_SLUGS = [HOME_PAGE_SLUG, 'daily-quiz']`.
- [ ] Include `HOME_PAGE_SLUG` in `LEGACY_HOME_REDIRECT_SLUGS` only if route
      handling should redirect `/telenor-answer-today` to `/`.
- [ ] Confirm the first-priority Tele Answer values remain unchanged:
      `Tele Answer Today`, `https://teleanswertoday.pk`, `G-Q6NJ8N20FV`,
      `Umy1DY5Vngn0XLt29V2gpg8Y7unQq6oF4tiW_fhoGnA`, `4789150646`.

## 2. WordPress Helpers

- [ ] Import `HOME_PAGE_SLUG` and `EXCLUDED_CONTENT_SLUGS` where needed.
- [ ] Add `getHomepageQuizPage()` in `lib/wordpress.js`.
- [ ] Fetch from `/pages?slug=telenor-answer-today`.
- [ ] Use `_embed=author,wp:featuredmedia`.
- [ ] Use the existing page field set.
- [ ] Use `next: { revalidate, tags: ['quiz'] }`.
- [ ] Update homepage callers to use `getHomepageQuizPage()`.
- [ ] Keep `getDailyQuizPost()` only as a compatibility alias if needed.
- [ ] Update post/archive helper defaults to exclude the right slugs.

## 3. Homepage

- [ ] Change `app/page.jsx` import from `getDailyQuizPost` to
      `getHomepageQuizPage`.
- [ ] Use the page result in `generateMetadata()`.
- [ ] Use page featured media as the Open Graph image fallback.
- [ ] Use page content for quiz parsing.
- [ ] Use page content for FAQ parsing.
- [ ] Update H1 to:
      `My Telenor Answer Today {todayLabel} - Latest Telenor Quiz Today`.
- [ ] Keep latest-news query and visual layout stable.
- [ ] Add visible fallback text when no quiz questions parse.

## 4. Parser

- [ ] Replace fragile encoded dash/emoji-only matching in `lib/quizParser.js`.
- [ ] Table parser accepts:
      `Question 1:`, `Question 1 -`, normal dash options, encoded dash options,
      `Answer:`, `Answer ->`, and existing emoji-arrow artifacts.
- [ ] Numbered parser accepts:
      `1. Question`, option lines, and `Answer:` lines.
- [ ] Parser does not require a question mark.
- [ ] Parser decodes HTML entities before matching.
- [ ] Parser returns only complete question/answer pairs.
- [ ] FAQ parser still supports existing `Q:` and `A:` content.
- [ ] FAQ parser may also support heading-plus-paragraph FAQ content if present.

## 5. Admin API

- [ ] Rename internal helpers from post-specific naming to page/source naming.
- [ ] GET `/api/quiz` reads `/pages?slug=telenor-answer-today&per_page=1`.
- [ ] GET returns empty questions only when the page lookup succeeds but no page
      exists.
- [ ] POST looks up the page first.
- [ ] POST updates `/pages/{id}` with `PUT`.
- [ ] POST does not create a post or page when WordPress lookup fails.
- [ ] POST stores escaped quiz table HTML.
- [ ] POST revalidates tag `quiz`.
- [ ] Error messages remain useful for admin users.

## 6. Sitemaps And Routes

- [ ] Exclude `telenor-answer-today` from page sitemap output.
- [ ] Confirm `/` remains the only homepage URL in sitemaps.
- [ ] Confirm `/sitemap.xml` still redirects to `/sitemap_index.xml`.
- [ ] Confirm `robots.txt` points to the public sitemap index.
- [ ] Confirm normal pages such as `/about-us`, `/contact-us`, and
      `/privacy-policy` remain included.

## 7. Tests

- [ ] Add parser test for table format without question mark.
- [ ] Add parser test for numbered WordPress page format.
- [ ] Add parser test for `Answer:` and `Answer ->`.
- [ ] Add admin lookup test for missing page versus unavailable WordPress.
- [ ] Add sitemap test or focused assertion for excluding `telenor-answer-today`.
- [ ] Update any existing tests that still assume `daily-quiz` is the homepage
      source.

## 8. Verification Commands

Run:

```powershell
npm.cmd run test
npm.cmd run lint
$env:WORDPRESS_API_URL='https://wp.teleanswertoday.pk/wp-json/wp/v2'; npm.cmd run build
```

Run final searches:

```powershell
rg -n "<old-public-domain>|<old-wp-domain>|<old-ga-id>|<old-search-console-id>|<old-ad-slot>" -S --glob "!node_modules/**" --glob "!.next/**" .
rg -n "daily-quiz|telenor-answer-today|getDailyQuizPost|getHomepageQuizPage" -S lib app test *.md
```

Expected:

- Old production values should not appear in current-state code/docs.
- `daily-quiz` may remain only as a legacy exclusion or compatibility path.
- `telenor-answer-today` should appear as the active homepage source.

## 9. Rollback Notes

If the page-source migration causes production risk:

- Revert homepage imports to `getDailyQuizPost()`.
- Revert `/api/quiz` lookup/update endpoints to posts.
- Keep first-priority config migration in place.
- Do not revert Tele Answer domain, Google IDs, AdSense slot, or docs unless
  specifically rolling back the whole domain migration.
