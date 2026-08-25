# CMS Home Template

## Purpose

The public homepage uses the website-specific CMS template key `home`. Its
content is rendered by the existing homepage layout, so posts, the shared daily
quiz, ads, sidebar, and FAQ schema continue to work without
manual HTML duplication.

Until a published Home template contains `contentData.heroText`, the current
React homepage is deliberately used as a safe fallback.

## Create The Template

In the shared Admin CMS, create or edit the template for
`teleanswertoday.pk` with:

```text
Template key: home
Published: yes
```

Use the CMS Home content/HTML field that is stored as:

```text
contentData.heroText
```

The body is normal editor HTML. It must contain one H1 and should use H2/H3 for
the remaining hierarchy. The app corrects an accidental missing or duplicate
H1, but editors should still write a single intentional H1.

## Required Dynamic Markers

Place this exact heading where the daily quiz cards should appear:

```html
<h2>Today Telenor Answer {date}</h2>
```

`{date}` is replaced with the current Karachi date. The app renders the shared
CMS daily quiz directly below that heading.

The homepage does not render a Latest News card grid. An obsolete
`<h2>Latest News</h2>` at the beginning of CMS content following the quiz is
removed automatically.

Use `{date}` in the Home template SEO title and SEO description when a daily
date is required there as well.

## FAQs

Keep homepage FAQs in `contentData.faqs`, not inside `heroText`, so the visible
FAQ component and its `FAQPage` schema always match. Use up to six valid items:

```json
[
  {
    "q": "What is today my Telenor question answer?",
    "a": "Answer text visible on the homepage."
  }
]
```

## Editing Result

After the Home template is published, editors can add or change homepage intro
text, headings, links, images, guides, steps, and other informational sections
in CMS. Saving should trigger revalidation for `/` so the public homepage
updates promptly.

Do not add daily quiz cards manually in the CMS body; they stay dynamic.
