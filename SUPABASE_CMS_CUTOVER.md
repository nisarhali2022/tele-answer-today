# Tele Answer Today Supabase CMS Cutover

## Current Public Architecture

`teleanswertoday.pk` is a Next.js public frontend. It reads only public,
read-only Supabase RPCs from the existing shared Admin CMS. It never receives a
Supabase service-role key and it does not call the Admin CMS's private APIs.

```text
Visitor
  -> teleanswertoday.pk (Vercel / Next.js)
  -> Supabase public RPCs and public cms-media URLs

Admin
  -> Shared Supabase Admin CMS
  -> Supabase database and cms-media Storage
  -> signed revalidation request to this public site
```

No retired CMS client, credential, editor, or maintenance script remains in
this project. Publishing work must happen in the shared Supabase Admin CMS.

## AdSense And `ads.txt`

AdSense publisher IDs and placement slots are CMS-managed. The app serves
`/ads.txt` from CMS settings. If a custom `adsTxt` value is blank, it derives
the standard Google authorization line from the CMS publisher ID so the public
endpoint remains available.

## Content Ownership

| Content | CMS source | Public behaviour |
| --- | --- | --- |
| Posts | Website-scoped CMS posts | `/<category>/<post>` routes, archives, search, cards, sitemap |
| Pages and policies | Website-scoped pages/templates | Existing public page routes and metadata |
| Authors and categories | Website-scoped CMS records | Existing author/category routes and sitemap |
| Images | Public `cms-media` Storage URLs | Direct public image URLs; no Vercel proxy for remote media |
| Homepage static React sections | Public repository | Preserved during cutover; FAQ data may be supplied by the CMS Home template |
| Homepage FAQ schema | CMS Home template FAQ data, or existing fallback | Only the visible first six valid items are rendered and included in JSON-LD |
| Daily quiz | Global CMS quiz | One published quiz serves every connected public website |
| Ads | Website CMS settings | Publisher ID, enabled flag, slots, and `ads.txt` are CMS-managed |

## Required Vercel Variables

Set these for Production, Preview, and Development as appropriate. The public
Supabase values are intentionally safe for browser-side use; never add a
service-role key to this repository or Vercel public-site project.

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
CMS_SITE_DOMAIN=teleanswertoday.pk
CMS_REVALIDATION_SECRET=<long random value matching the CMS website setting>
NEXT_PUBLIC_CMS_ADMIN_URL=https://<shared-admin-cms-domain>
CRON_SECRET=<existing cron secret>
DISABLE_ADSENSE=false
```

Use `.env.example` for local variable names. Do not commit `.env.local`.

## CMS Website Setup

1. In the setup/provisioning CMS, create or select the `teleanswertoday.pk`
   website record and confirm it is active.
2. Set its primary domain to `teleanswertoday.pk`; add any preview/test domain
   only when intentionally needed.
3. Import WordPress data only while the website is inactive. Review imported
   posts, pages, authors, categories, media, SEO values, and redirects before
   activation.
4. Publish the Home template and enter any CMS-managed FAQ items in
   `contentData.faqs` as `{ q, a }` pairs.
5. Add/verify local asset references separately; the current logo, favicon,
   OG image, and homepage step images remain application-owned `public/assets`
   files.
6. After parity checks pass, mark the CMS site active and direct editorial work
   to the shared Admin CMS.

## Global Quiz

The daily quiz is intentionally global. Editing it in the shared Admin CMS
changes the quiz for every active public website connected to that CMS.

The public homepage calls `cms_public_get_current_quiz()` and renders the
returned `questions` array. It does not parse a WordPress post and it does not
write any quiz content. The former `/admin/quiz` route is retired as an editor;
use the shared Admin CMS quiz screen instead.

When the CMS publishes a global quiz update, it requests revalidation for:

```text
/
/page-sitemap.xml
/sitemap_index.xml
```

The visible homepage date remains independently calculated in Pakistan time.

## CMS-Managed AdSense

Set this website's `adsense` settings in the CMS with:

```json
{
  "enabled": true,
  "publisherId": "ca-pub-...",
  "adsTxt": "google.com, pub-..., DIRECT, f08c47fec0942fa0",
  "slots": {
    "top": "...",
    "mid": "...",
    "inArticle": "...",
    "sidebar": "...",
    "afterContent": "...",
    "bottom": "..."
  }
}
```

The public site loads the native AdSense script only when this CMS setting is
enabled and has a valid `ca-pub-` publisher ID. `/ads.txt` is served from the
same CMS setting. Local development still suppresses real ad requests, and
`DISABLE_ADSENSE=true` pauses production ads without deleting their settings.

## Revalidation Webhook

For this website's CMS revalidation setting, configure:

```text
Webhook URL: https://teleanswertoday.pk/api/revalidate
Secret:      the exact CMS_REVALIDATION_SECRET set in Vercel
```

The CMS sends the secret in the `x-cms-revalidation-secret` request header and
a payload such as:

```json
{
  "event": "global_quiz.updated",
  "paths": ["/", "/page-sitemap.xml", "/sitemap_index.xml"],
  "resourceType": "global_quiz",
  "resourceId": "..."
}
```

The endpoint rejects missing or mismatched secrets with HTTP 401, revalidates
only safe `/...` paths, and invalidates the shared `cms` cache tag.

## Cutover Verification

1. Confirm posts, pages, authors, categories, media, Home template, and
   redirects are published in the CMS for `teleanswertoday.pk`.
2. Deploy the public project with the required variables.
3. Test `/`, `/blog`, a category, an article, an author, `/ads.txt`,
   `/robots.txt`, and all sitemap routes.
4. Update a CMS post and verify its public path refreshes through the CMS
   webhook without a Vercel redeploy.
5. Update the global quiz and verify all connected sites refresh their
   homepage quiz cards.
6. Verify CMS AdSense settings control the production script, slots, and
   `/ads.txt` output.
7. Keep WordPress available for a short rollback window, but do not accept new
   editorial updates there after this verification succeeds.

## Open Cutover Items

- The CMS currently returns published About, Contact, and Privacy templates.
  Publish the Home template with its title, SEO image, and at least six valid
  FAQ pairs before making that template the primary homepage content source.
  Until then, the existing React homepage and six-item FAQ fallback remain
  visible.
- Publish/import Editorial Policy and Corrections Policy content if those URLs
  must remain live; they are not present in the public CMS content index yet.
- The CMS intentionally has no tag model. The current legacy tag archive is
  noindex, but a final cutover decision is still required: redirect useful tag
  URLs in the CMS redirect manager, then retire the remaining tag archive.

## Rollback Window

If a serious cutover issue occurs, deactivate the CMS website record, point
the public deployment back to the known WordPress data layer/commit, and
revalidate affected routes. After the agreed rollback window, archive the
WordPress import credentials and remove the legacy integration code.
