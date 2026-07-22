# Tele Answer Today External Audit and Implementation Handoff

Audit target: `https://teleanswertoday.pk`

Repository: `nisarhali2022/tele-answer-today`

Prepared: 2026-07-23

## Purpose

Use this document when giving the project to another developer, auditor, or
AI coding agent. The goal is to review the live website and repository, identify
real issues, and implement appropriate fixes without restoring the retired
WordPress architecture or changing working behavior unnecessarily.

## Current Architecture

- Public frontend: Next.js App Router deployed on Vercel.
- Public content source: shared Supabase Admin CMS.
- Website domain: `teleanswertoday.pk`.
- CMS website selector: `CMS_SITE_DOMAIN=teleanswertoday.pk`.
- CMS media: public Supabase CMS media URLs.
- Daily quiz: global Supabase CMS quiz shared with connected websites.
- Editorial management: shared Supabase Admin CMS, not the public Next.js app.
- Revalidation: signed CMS webhook calls the public `/api/revalidate` endpoint.
- Public caching: ISR/CDN caching with a one-hour default for public CMS routes.
- Redirects: CMS redirect records are fetched during `next build`, validated,
  and compiled into native Next.js/Vercel redirects.

WordPress and Hostinger are permanently retired from public delivery. Do not
restore WordPress API requests, WordPress credentials, WordPress middleware,
Hostinger frontend routing, or WordPress as a rollback source.

## Current Source of Truth

| Area | Source |
| --- | --- |
| Posts | Website-scoped Supabase CMS records |
| Pages and policies | Website-scoped Supabase CMS records |
| Homepage content | Supabase CMS Home template with React fallback where configured |
| Daily quiz | Global Supabase CMS quiz |
| Authors and categories | Supabase CMS records |
| Images | Supabase CMS media storage and local `public/assets` files |
| Ads settings | CMS-managed website settings, according to the current app contract |
| Analytics/Search Console IDs | Static application configuration where defined |
| Redirects | CMS redirect table, compiled at build time |

## Non-Negotiable Rules

1. Do not reintroduce WordPress or Hostinger as a runtime dependency.
2. Do not expose Supabase service-role keys or CMS private credentials.
3. Do not write development URLs, backend URLs, or private CMS URLs into public
   content or metadata.
4. Do not change the global quiz sharing model without approval.
5. Do not remove signed webhook authentication or make revalidation public.
6. Do not make Google Analytics, Search Console, or AdSense configuration
   editable through arbitrary public content unless the existing CMS contract
   explicitly requires it.
7. Preserve the public URL format: HTTPS, non-`www`, no trailing slash.
8. Preserve one visible H1 per indexable page.
9. Do not add fake ratings, reviews, local-business details, or unsupported
   schema markup.
10. Do not copy content, images, FAQs, or metadata from another website.

## Audit Scope

Review both the repository and the deployed site. Check the following areas.

### 1. Functional Behavior

- Homepage loads the CMS Home template, quiz, Latest News, navigation, and
  required sections correctly.
- CMS-authored pages, posts, categories, authors, search, and policy routes
  load correctly.
- Global quiz updates appear after the signed CMS webhook.
- Content updates do not require a redeploy unless they are redirect changes.
- Missing content returns a proper 404 or intentional noindex response.
- Admin and API routes do not leak secrets or private CMS data.

### 2. SEO and AEO

- Every indexable route has a unique title and meta description.
- Canonicals use `https://teleanswertoday.pk` and the final public path.
- No canonical points to Supabase, WordPress, Hostinger, localhost, `www`, or
  an obsolete route.
- Homepage has exactly one H1.
- CMS content cannot create empty or duplicate H1-H4 headings in the rendered
  homepage or article body.
- H2/H3 hierarchy is meaningful and the homepage TOC links to real IDs.
- Sitemap index and child sitemaps contain only published, indexable,
  canonical public URLs.
- `daily-quiz` is not exposed as a normal public article/listing unless the
  product explicitly requires it.
- Robots rules allow public pages and disallow private/admin/API routes.
- Organization, WebSite, WebPage, Article, BreadcrumbList, Person, and visible
  FAQ schema are accurate and validated. FAQ schema must describe only visible
  FAQ items.
- Images have meaningful alt text and social metadata has absolute URLs.

### 3. Performance and Core Web Vitals

- Check production PageSpeed/Lighthouse on mobile and desktop.
- Record LCP, INP or TBT, CLS, FCP, TTFB, and total performance score.
- Confirm the first homepage request can be prerendered and later requests are
  cache hits where expected.
- Confirm CMS data reads are cacheable and do not depend on request headers.
- Confirm local images use the expected Next.js handling.
- Confirm remote CMS images do not produce failing `/_next/image` proxy URLs.
- Confirm image dimensions, lazy loading, responsive sizes, and WebP/AVIF
  behavior.
- Confirm ads do not create excessive mobile blank space or duplicate push
  errors.
- Check JavaScript bundle size, third-party scripts, fonts, and layout shift.

### 4. Responsive UX and Accessibility

Test at minimum:

- 360px mobile
- 375px mobile
- 430px mobile
- 768px tablet
- 1024px tablet/small desktop
- 1280px or wider desktop

Check:

- No page-level horizontal overflow.
- Wide content tables scroll inside their own responsive wrapper.
- Fixed-header anchor links leave headings visible below the header.
- Mobile navigation opens, closes, and supports submenu items.
- Quiz options use the intended mobile and desktop layout.
- Text remains readable and does not overlap controls.
- Buttons and links are touch-friendly.
- Keyboard focus, labels, alt text, contrast, and semantic landmarks work.

### 5. Security and Operations

- HTTPS and non-`www` redirects work.
- Response headers include:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restricting unnecessary browser capabilities
- Check whether a tested Content-Security-Policy is appropriate before adding
  one; account for AdSense and analytics scripts.
- API routes validate secrets, methods, input, and error responses.
- CMS and Supabase backups, access control, dependency updates, and monitoring
  are confirmed operationally.
- Do not print environment values, auth headers, or application passwords in
  logs or reports.

## Redirect Contract

The shared Supabase RPC is:

```text
public.list_public_redirects(domain text)
```

It must return only active redirects belonging to the supplied CMS website.
The build helper must reject invalid records, including:

- malformed source paths;
- query strings or hashes in source paths;
- external destinations;
- duplicate source paths;
- source-to-destination loops;
- invalid redirect types;
- conflicts with reserved application routes.

CMS `301` records are emitted as Next.js permanent redirects, which normally
produce HTTP `308`. CMS `302` records remain temporary. Redirect edits require
a new Vercel deployment because visitor requests do not query Supabase for
redirects.

## Revalidation Contract

Use the CMS webhook for content and quiz updates:

```text
POST https://teleanswertoday.pk/api/revalidate
```

Required authentication is the configured secret header:

```text
x-revalidate-secret: <CMS_REVALIDATION_SECRET>
```

The exact secret must come from the CMS website setting and Vercel environment
configuration. Never commit or paste the real secret into this document.

The webhook should invalidate the affected path and the `cms` cache tag. A
global quiz update should invalidate the homepage and relevant sitemap paths.
Do not replace this with an unauthenticated browser-side request.

## Required Repository Checks

Run from the project root:

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

Search for retired or unsafe references:

```powershell
rg -n "telenorquiztoday|wp\.telenorquiztoday|wp\.teleanswertoday|wordpress|hostinger|localhost:3000|NEXT_PUBLIC_SUPABASE_SERVICE_ROLE|service_role" -S --glob "!node_modules/**" --glob "!.next/**" .
```

Review route and SEO implementation:

```powershell
rg -n "generateMetadata|canonical|robots|sitemap|JsonLd|schema|noindex|revalidatePath|revalidateTag|CMS_SITE_DOMAIN|list_public_redirects" app components lib next.config.js supabase -S
```

## Required Live Checks

Check these URLs in production:

```text
https://teleanswertoday.pk/
https://teleanswertoday.pk/blog
https://teleanswertoday.pk/telecom
https://teleanswertoday.pk/tech
https://teleanswertoday.pk/telenor
https://teleanswertoday.pk/jazz
https://teleanswertoday.pk/zong
https://teleanswertoday.pk/author/wazir-ali
https://teleanswertoday.pk/privacy-policy
https://teleanswertoday.pk/contact-us
https://teleanswertoday.pk/robots.txt
https://teleanswertoday.pk/sitemap_index.xml
https://teleanswertoday.pk/post-sitemap.xml
https://teleanswertoday.pk/page-sitemap.xml
https://teleanswertoday.pk/category-sitemap.xml
```

For each representative content URL, record:

- HTTP status;
- final URL after redirects;
- canonical URL;
- robots/indexability state;
- H1 count;
- cache headers;
- schema types;
- image failures;
- console errors.

## Required Deliverables From the Auditor

Return a report with:

1. Findings ordered by `Critical`, `High`, `Medium`, and `Low` priority.
2. Exact file and line references for repository issues.
3. Exact production URLs and evidence for live issues.
4. Clear distinction between confirmed bugs, live verification gaps, and
   recommendations.
5. A minimal implementation plan for every confirmed issue.
6. Tests added or updated for every behavior change.
7. Test, lint, and build results.
8. A deployment checklist and rollback-safe release notes.

Do not report a missing PageSpeed or Search Console measurement as a code bug.
Mark it as `Needs Live Verification` until measured.

## Approval Boundary

Safe to implement without additional approval:

- clear bugs in existing routes/components;
- accessibility fixes that preserve visible content;
- canonical, sitemap, robots, and metadata corrections;
- responsive overflow and layout fixes;
- tests and documentation updates;
- performance fixes that preserve CMS and ad contracts.

Ask before implementing:

- content rewrites or deletion;
- changing the global quiz sharing model;
- changing CMS schema or RPC return types;
- changing ad publisher/slot ownership;
- adding cross-domain redirects;
- restoring any retired WordPress/Hostinger integration;
- deleting CMS data or changing production settings.

## Completion Standard

The audit is complete only when:

- confirmed findings are fixed or explicitly accepted;
- tests, lint, and build pass;
- production URLs and redirects are spot-checked;
- sitemap and robots outputs are valid;
- no retired runtime dependency is restored;
- documentation reflects the deployed architecture;
- remaining external measurements are listed separately as verification tasks.

