# Tele Answer Today Implementation Checklist

Use this checklist for the migration after the first-priority config work.
Status updated June 22, 2026.

## 1. Constants And Shared Slugs

- [x] Add `HOME_PAGE_SLUG = 'telenor-answer-today'` in `lib/constants.js`.
- [x] Add `EXCLUDED_CONTENT_SLUGS = [HOME_PAGE_SLUG, 'daily-quiz']`.
- [x] Include `HOME_PAGE_SLUG` in `LEGACY_HOME_REDIRECT_SLUGS` only if route
      handling should redirect `/telenor-answer-today` to `/`.
- [x] Confirm the first-priority Tele Answer values remain unchanged:
      `Tele Answer Today`, `https://teleanswertoday.pk`, `G-Q6NJ8N20FV`,
      `Umy1DY5Vngn0XLt29V2gpg8Y7unQq6oF4tiW_fhoGnA`, `4789150646`.

## 2. WordPress Helpers

- [x] Import `HOME_PAGE_SLUG` and `EXCLUDED_CONTENT_SLUGS` where needed.
- [x] Add `getHomepageQuizPage()` in `lib/wordpress.js`.
- [x] Fetch from `/pages?slug=telenor-answer-today`.
- [x] Use `_embed=author,wp:featuredmedia`.
- [x] Use the existing page field set.
- [x] Use `next: { revalidate, tags: ['quiz'] }`.
- [x] Update homepage callers to use `getHomepageQuizPage()`.
- [x] Keep `getDailyQuizPost()` only as a compatibility alias if needed.
- [x] Update post/archive helper defaults to exclude the right slugs.

## 3. Homepage

- [x] Change `app/page.jsx` import from `getDailyQuizPost` to
      `getHomepageQuizPage`.
- [x] Use the page result in `generateMetadata()`.
- [x] Use page featured media as the Open Graph image fallback.
- [x] Use page content for quiz parsing.
- [x] Use page content for FAQ parsing.
- [x] Update H1 to:
      `My Telenor Answer Today {todayLabel} - Latest Telenor Quiz Today`.
- [x] Keep latest-news query and visual layout stable.
- [x] Add visible fallback text when no quiz questions parse.
- [x] Keep the homepage intro, informational sections, and participation steps
      in app-owned React content after reverting the temporary WordPress body
      rendering experiment.

## 4. Parser

- [x] Replace fragile encoded dash/emoji-only matching in `lib/quizParser.js`.
- [x] Table parser accepts:
      `Question 1:`, `Question 1 -`, normal dash options, encoded dash options,
      `Answer:`, `Answer ->`, and existing emoji-arrow artifacts.
- [x] Numbered parser accepts:
      `1. Question`, option lines, and `Answer:` lines.
- [x] Parser does not require a question mark.
- [x] Parser decodes HTML entities before matching.
- [x] Parser returns only complete question/answer pairs.
- [x] FAQ parser still supports existing `Q:` and `A:` content.
- [x] FAQ parser may also support heading-plus-paragraph FAQ content if present.

## 5. Admin API

- [x] Rename internal helpers from post-specific naming to page/source naming.
- [x] GET `/api/quiz` reads `/pages?slug=telenor-answer-today&per_page=1`.
- [x] GET returns empty questions only when the page lookup succeeds but no page
      exists.
- [x] POST looks up the page first.
- [x] POST updates `/pages/{id}` with `PUT`.
- [x] POST does not create a post or page when WordPress lookup fails.
- [x] POST stores escaped quiz table HTML.
- [x] POST revalidates tag `quiz`.
- [x] Error messages remain useful for admin users.

## 6. Sitemaps And Routes

- [x] Exclude `telenor-answer-today` from page sitemap output.
- [x] Confirm `/` remains the only homepage URL in sitemaps.
- [x] Confirm `/sitemap.xml` still redirects to `/sitemap_index.xml`.
- [x] Confirm `robots.txt` points to the public sitemap index.
- [x] Confirm normal pages such as `/about-us`, `/contact-us`, and
      `/privacy-policy` remain included.

## 7. Tests

- [x] Add parser test for table format without question mark.
- [x] Add parser test for numbered WordPress page format.
- [x] Add parser test for `Answer:` and `Answer ->`.
- [x] Add admin lookup test for missing page versus unavailable WordPress.
- [x] Add sitemap test or focused assertion for excluding `telenor-answer-today`.
- [x] Update any existing tests that still assume `daily-quiz` is the homepage
      source.

## 8. SEO And UI Fixes Completed

- [x] Add `prepareWordPressContent()` for WordPress body rendering.
- [x] Remove embedded H1 blocks from WordPress content before rendering.
- [x] Apply the helper to static WordPress pages, dynamic pages, and posts.
- [x] Verify representative rendered routes have exactly one H1.
- [x] Make the header fixed with a matching responsive spacer.
- [x] Add live-site matching submenus for Telenor Packages and Telenor Codes.
- [x] Verify desktop, tablet, and mobile navigation has no horizontal overflow.
- [x] Convert `/editorial-policy` and `/corrections-policy` from hardcoded
      React copy to WordPress-backed pages.
- [x] Keep Google Analytics, Google AdSense, and Google Search Console values
      static in app configuration for consistent sitewide tracking,
      advertising, and verification.

## 9. Verification Commands

Run:

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
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

## 10. Rollback Notes

If the page-source migration causes production risk:

- Revert homepage imports to `getDailyQuizPost()`.
- Revert `/api/quiz` lookup/update endpoints to posts.
- Keep first-priority config migration in place.
- Do not revert Tele Answer domain, Google IDs, AdSense slot, or docs unless
  specifically rolling back the whole domain migration.
