# WordPress Quiz Source Safety Note

## Current Source Split

- Static homepage content is app-owned React content and should not be changed
  by quiz saves.
- Homepage quiz cards read from the WordPress post slug `daily-quiz`.
- Homepage FAQ parsing and metadata image fallback may read from the WordPress
  page slug `telenor-answer-today`.
- `/admin/quiz` must read and write only the `daily-quiz` post.

## WordPress Front Page Warning

Do not use `/admin/quiz` to update a WordPress page, the WordPress Front Page,
or page ID `640`.

If WordPress shows an old page like `Daily Quiz - 25 June 2026` as the Front
Page, fix that inside WordPress:

1. Go to WordPress Admin > Settings > Reading.
2. Remove the old quiz page from the Homepage/Front Page selection, or restore
   it to the proper homepage page content.
3. Keep one published post with slug `daily-quiz`.
4. Keep `daily-quiz` out of menus and normal navigation.

## Expected Admin Behavior

When the admin saves quiz questions:

- If the `daily-quiz` post exists, the app updates that post.
- If the `daily-quiz` post is missing and the WordPress API user can create
  posts, the app creates it once.
- Normal saves after that update the same post.

Saving quiz questions must not change static homepage React content.
