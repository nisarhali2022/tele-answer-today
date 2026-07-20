# Deployment DNS Checklist

> **CMS cutover note:** the public site now reads the shared Supabase Admin CMS.
> Use [SUPABASE_CMS_CUTOVER.md](SUPABASE_CMS_CUTOVER.md) for the current Vercel
> environment variables, signed revalidation webhook, CMS-managed AdSense, and
> content-import steps. The older instructions below are historical reference
> only and must not be used for runtime configuration or publishing.

## Goal

Move the public website to Vercel while keeping WordPress on Hostinger as the
backend.

```text
https://teleanswertoday.pk
  -> Vercel / Next.js public site

https://wp.teleanswertoday.pk
  -> Hostinger / WordPress admin and REST API
```

## Current Nameservers

The domain is registered at Domain.pk, but DNS is managed by Hostinger because
the active nameservers are:

```text
ns1.dns-parking.com
ns2.dns-parking.com
```

Therefore DNS changes should be made in:

```text
Hostinger -> Domains -> teleanswertoday.pk -> DNS / Nameservers
```

Do not change nameservers at Domain.pk during this migration.

## Before Changing DNS

Confirm these are complete:

- [ ] Vercel project is deployed successfully.
- [ ] Vercel project has this environment variable:

```text
WORDPRESS_API_URL=https://wp.teleanswertoday.pk/wp-json/wp/v2
```

- [ ] Vercel project has required secrets:

```text
WP_ADMIN_USER
WP_ADMIN_PASS
ADMIN_SECRET
REVALIDATE_SECRET
CRON_SECRET
```

Google Ads/AdSense IDs are not Vercel environment variables. They are static
application configuration in `lib/constants.js`, and `public/ads.txt` is kept
in the repo.

Local development intentionally disables AdSense requests to avoid localhost
Google ad `403` console noise. Production keeps the static publisher and slot
IDs.

To temporarily pause production AdSense without removing the integration, set
this optional Vercel environment variable:

```env
DISABLE_ADSENSE=true
```

Remove it, or set it to any value other than `true`, to enable AdSense again.

- [ ] Vercel Domains settings includes:

```text
teleanswertoday.pk
www.teleanswertoday.pk
```

- [ ] WordPress backend works:

```text
https://wp.teleanswertoday.pk/wp-admin
https://wp.teleanswertoday.pk/wp-json/wp/v2/posts
```

## Hostinger DNS Changes

In the DNS zone for:

```text
teleanswertoday.pk
```

### 1. Root Domain

Edit the existing `A` record:

```text
Type: A
Name: @
Current value: 212.85.29.19
New value: 76.76.21.21
TTL: 300 or default
```

This points the root domain to Vercel.

### 2. Remove Hostinger IPv6 Root Record

Delete the existing root `AAAA` record:

```text
Type: AAAA
Name: @
Current value: 2a02:4780:1587:...
```

Reason: if this Hostinger IPv6 record remains, some visitors may still reach
Hostinger instead of Vercel.

### 3. WWW Domain

Edit the existing `www` CNAME:

```text
Type: CNAME
Name: www
Current value: teleanswertoday.pk
New value: cname.vercel-dns.com
TTL: 300 or default
```

Use the exact value shown in Vercel if Vercel gives a different value.

## Records Not To Touch

Do not delete or edit email records:

```text
MX
TXT SPF
TXT DMARC
hostinger DKIM CNAME records
autodiscover
autoconfig
```

Do not click:

```text
Reset DNS records
```

## WordPress Backend Safety Check

Make sure the `wp` subdomain still points to Hostinger.

Search the DNS zone for:

```text
wp
```

Expected:

```text
wp.teleanswertoday.pk -> Hostinger
```

Do not delete the `wp` record, WordPress files, or WordPress database.

## WordPress Backend Noindex

The WordPress backend should not be indexed by Google.

In WordPress:

```text
Settings -> Reading -> Discourage search engines from indexing this site
```

Also serve this on:

```text
https://wp.teleanswertoday.pk/robots.txt
```

```txt
User-agent: *
Disallow: /
```

This does not block Vercel from using the REST API.

## After DNS Change

Wait for DNS propagation, then test:

```text
https://teleanswertoday.pk
```

Expected: opens the Vercel Next.js website.

```text
https://www.teleanswertoday.pk
```

Expected: opens or redirects to the Vercel website.

```text
https://wp.teleanswertoday.pk/wp-admin
```

Expected: opens WordPress admin on Hostinger.

```text
https://wp.teleanswertoday.pk/wp-json/wp/v2/posts
```

Expected: returns WordPress REST API data.

```text
https://teleanswertoday.pk/sitemap_index.xml
```

Expected: returns the Next.js sitemap index.

## Important Rule

Do not remove the domain/site from Hostinger yet.

Only change DNS so:

```text
teleanswertoday.pk -> Vercel
www.teleanswertoday.pk -> Vercel
wp.teleanswertoday.pk -> Hostinger
```

Removing the main domain from Hostinger can break the `wp.` subdomain if
Hostinger also removes the DNS zone, files, database, or subdomain mapping.

## Latest Deployment Verification - 2026-06-20

After DNS and Vercel deployment are complete, verify these URLs:

```text
https://teleanswertoday.pk/
https://www.teleanswertoday.pk/
https://teleanswertoday.pk/ads.txt
https://teleanswertoday.pk/robots.txt
https://teleanswertoday.pk/sitemap_index.xml
https://teleanswertoday.pk/sitemap.xml
https://wp.teleanswertoday.pk/wp-json/wp/v2/posts
```

Expected results:

- Root domain and `www` domain both serve the Vercel Next.js site.
- `/ads.txt` returns the Google seller line.
- `/robots.txt` allows public crawling, blocks `/api/`, and lists the sitemap
  index.
- `/sitemap_index.xml` returns the XML sitemap index.
- `/sitemap.xml` redirects to `/sitemap_index.xml`.
- `wp.teleanswertoday.pk` remains on Hostinger and the WordPress REST API
  stays reachable for Vercel.

Do not delete the Hostinger WordPress installation, database, or `wp.`
subdomain. Only the public root domain should point to Vercel.

## Post-Deploy Functional Smoke Checks - 2026-06-25

After deploying the latest build, verify:

```text
https://teleanswertoday.pk/
https://teleanswertoday.pk/admin/quiz
https://teleanswertoday.pk/sitemap_index.xml
https://teleanswertoday.pk/page-sitemap.xml
```

Expected results:

- Saving from `/admin/quiz` updates only the WordPress post slug `daily-quiz`.
- The WordPress page slug `telenor-answer-today`, the WordPress Front Page, and
  old page ID `640` are not changed by quiz saves.
- Mobile homepage does not show a large blank area under the header when the
  top AdSense slot is unfilled.
- Wide WordPress-rendered tables scroll horizontally inside the table area on
  mobile, while the page itself has no horizontal scroll.
- Homepage static React content remains unchanged after quiz updates.
- Homepage emits `FAQPage` JSON-LD only for the same visible FAQ items shown to
  users, capped at six valid question/answer pairs.
- WordPress media should load from canonical `wp.teleanswertoday.pk` media URLs,
  not Vercel `/_next/image` proxy URLs.
- Next image qualities `60`, `70`, and `75` are configured to match current
  component usage.

## WordPress Update Revalidation Webhook

To make WordPress edits appear quickly on the Vercel frontend, configure
WordPress to call:

```text
POST https://teleanswertoday.pk/api/revalidate
```

Required header:

```text
x-revalidate-secret: <Vercel REVALIDATE_SECRET value>
```

Preferred body for nested posts:

```json
{
  "path": "/telenor/telenor-packages"
}
```

Fallback body if the webhook can send separate fields:

```json
{
  "category": "telenor",
  "slug": "telenor-packages"
}
```

Expected result:

- `/telenor/telenor-packages` is revalidated directly.
- `/`, `/sitemap_index.xml`, `/post-sitemap.xml`, `/page-sitemap.xml`, and
  `/category-sitemap.xml` are also revalidated.
- Slug-only webhook bodies still work for simple page routes such as
  `/privacy-policy`.
