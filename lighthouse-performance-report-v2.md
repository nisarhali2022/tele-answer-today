# 🚦 Lighthouse Performance Audit Report — v2
**URL:** `https://tele-answer-today.vercel.app`  
**Audit Type:** Core Web Vitals & Performance Insights  
**Revision:** Second audit after partial fixes applied

> **Historical report:** This audit also predates the completed June 19, 2026
> migration and performance pass. The proposed first-news-image `priority`
> change is no longer the current recommendation because it produced competing
> preload signals. The custom preloader and Latest News priority flag were
> removed, static WordPress-upload assets were moved into `public/assets/`,
> and WordPress backend/API configuration is now environment-only. Re-run
> Lighthouse against the deployed production build before treating any metric
> or recommendation below as current.
>
> **Follow-up note, June 25, 2026:** mobile empty AdSense slots now collapse,
> and WordPress tables now scroll horizontally inside `.wp-table-scroll`
> wrappers. Re-run Lighthouse after deployment for updated mobile layout and
> Core Web Vitals measurements.
>
> **Follow-up note, June 28, 2026:** WordPress-backed images now bypass Vercel
> `/_next/image` proxying and keep canonical WordPress media URLs. Next image
> qualities `60`, `70`, and `75` are explicitly configured, and AdSense is
> disabled during local development to avoid localhost ad-request `403` noise.

---

## 📈 Progress Tracker (v1 → v2)

| Issue | v1 Status | v2 Status | Change |
|---|---|---|---|
| `loading="lazy"` on LCP image | ❌ Present | ✅ Removed | Fixed |
| `fetchpriority="high"` on LCP image | ❌ Missing | ❌ Still missing | Not fixed |
| Render-blocking CSS | ❌ 408 ms | ❌ 150 ms | Improved but not resolved |
| Critical path latency | ❌ 408 ms | 🔴 1,097 ms | **Regressed — needs attention** |
| Unused AdSense JS (154 KiB) | ❌ Present | ✅ Gone | Fixed |

> **Good news:** `loading="lazy"` is gone and AdSense unused JS is resolved.  
> **Concern:** The critical path latency jumped from 408 ms → 1,097 ms. This is likely due to a slower network condition during this test run — the CSS file size is identical (9.66 KiB), so the resource itself hasn't changed. Run Lighthouse a few more times to confirm if this is a fluke or a real regression. The two remaining issues are what need fixing now.

---

## 🔍 Remaining Issues & Fixes

---

### Issue 1 — LCP Image: `fetchpriority=high` Still Missing
**Severity:** 🔴 High  
**Affected Metric:** LCP  

#### What's Wrong
The `loading="lazy"` was removed (good!), but the `priority` prop was **not fully applied** — the rendered HTML still lacks `fetchpriority="high"`. Lighthouse confirms all three sub-checks are still failing:

```
✅ LCP resources should not use loading=lazy        ← Fixed
❌ fetchpriority=high should be applied             ← Still failing
❌ Request is discoverable in initial document      ← Still failing
```

**Current rendered HTML:**
```html
<img
  decoding="async"
  data-nimg="fill"
  ...
  <!-- ❌ No fetchpriority="high" -->
  <!-- ❌ No loading="eager" either — missing explicit eager signal -->
/>
```

#### Root Cause
In Next.js, the `priority` prop on `<Image>` does two things:
1. Injects a `<link rel="preload">` tag in `<head>` — making the image **discoverable immediately**
2. Sets `fetchpriority="high"` and removes `loading="lazy"`

If you only removed `lazy` manually but didn't add `priority` to the `<Image>` component, **neither of the other two benefits apply**.

#### ✅ Fix — Add `priority` to the Next.js Image Component

Find your hero/card image component (the one rendering the article thumbnail that appears first on page):

```jsx
// ❌ Current — lazy removed but priority not set
<Image
  src={article.image}
  alt={article.title}
  fill
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// ✅ Fixed — add priority to the FIRST/TOP card only
<Image
  src={article.image}
  alt={article.title}
  fill
  priority                   // ← Add this ONE prop
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

> ⚠️ **Critical:** Add `priority` **only to the first visible card/image** on the page — the one that is the LCP element. Applying it to all cards will cause multiple high-priority preloads, which defeats the purpose and can slow things down.

#### How to Identify Which Card Gets `priority`

If your cards are rendered in a list/map, use the index:

```jsx
{articles.map((article, index) => (
  <ArticleCard
    key={article.id}
    article={article}
    imagePriority={index === 0}   // Pass priority flag only for first item
  />
))}

// Inside ArticleCard component:
<Image
  src={article.image}
  alt={article.title}
  fill
  priority={imagePriority}         // Use the prop here
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

#### What This Fix Does Behind the Scenes
Next.js will automatically inject this into your `<head>`:
```html
<!-- Auto-injected by Next.js when priority is set -->
<link
  rel="preload"
  as="image"
  fetchpriority="high"
  imagesrcset="/_next/image?url=...&w=640 640w, /_next/image?url=...&w=1080 1080w"
  imagesizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```
This tells the browser to **start downloading the image immediately** during HTML parsing — before it even reaches the `<img>` tag in the body.

---

### Issue 2 — Render-Blocking CSS (Est. savings: 100 ms)
**Severity:** 🟡 Medium  
**Affected Metrics:** LCP, FCP  

#### What's Wrong
```
/_next/static/css/58e779...ae93.css — 9.7 KiB, blocking for 150 ms
```
This single CSS bundle is a **render-blocking resource** — the browser pauses all rendering until it is fully downloaded and parsed. At 9.7 KiB it's small, but on slow connections (mobile 3G/4G) 150 ms can be significantly worse.

The critical path chain looks like this:
```
HTML download (778 ms)
  └── CSS download starts (blocks render)
        └── First paint only possible here (1,097 ms total)
```

#### ✅ Fix A — Enable Next.js `optimizeCss` (Easiest)

This is the lowest-effort fix for a Next.js project. It uses the `critters` library to automatically extract and inline critical CSS, then loads the rest non-blocking:

```bash
npm install critters
```

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,   // Auto-inlines critical CSS, defers the rest
  },
}

module.exports = nextConfig
```

> ⚠️ **Note:** `optimizeCss` is experimental. Test thoroughly — it can occasionally cause style flash on first load if critical CSS extraction misses some styles. If it causes visual issues, use Fix B instead.

---

#### ✅ Fix B — Manually Preload the CSS (Safe Alternative)

Add a `<link rel="preload">` for the CSS in your `_document.js` / `layout.tsx`:

```jsx
// app/layout.tsx (Next.js App Router)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preload the CSS so it starts downloading earlier */}
        <link
          rel="preload"
          href="/_next/static/css/58e779588926ae93.css"
          as="style"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

> ⚠️ **Note:** The CSS filename hash (`58e779...ae93`) changes on every build. Don't hardcode it — instead, use Fix A or Fix C for a permanent solution.

---

#### ✅ Fix C — Load CSS Non-Blocking with JS Fallback (Most Compatible)

```html
<!-- In _document.js or layout.tsx <head> -->
<link
  rel="preload"
  href="/_next/static/css/58e779588926ae93.css"
  as="style"
  onLoad="this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="/_next/static/css/58e779588926ae93.css" />
</noscript>
```

This loads the CSS **in parallel** with HTML parsing instead of blocking it. The `noscript` tag ensures it still works when JavaScript is disabled.

---

#### ✅ Fix D — Split CSS & Only Load What's Needed

If the CSS bundle is large, consider splitting it. In `next.config.js`:

```js
const nextConfig = {
  // Ensure CSS is properly code-split per page
  webpack: (config) => {
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
        },
      },
    }
    return config
  },
}
```

---

## 🚨 Critical Path Latency Regression (408 ms → 1,097 ms)

The network dependency tree shows the critical path got significantly worse:

| Audit | Initial Nav | CSS Load | Total Critical Latency |
|---|---|---|---|
| v1 | 254 ms | 408 ms | 408 ms |
| v2 | 778 ms | 1,097 ms | 1,097 ms |

**The CSS file is unchanged (9.66 KiB)**, so this isn't a code issue. Possible causes:

1. **Network variability** — Lighthouse simulates throttled mobile network. Results can vary ±30% between runs. Run 3–5 audits and average them before concluding there's a regression.
2. **Vercel cold start** — Vercel serverless functions can have cold starts. If the HTML itself took 778 ms (vs 254 ms in v1), the server was likely cold.
3. **New blocking resource added** — Check if any new script or resource was added that now pushes the CSS further down the waterfall.

**Recommended action:** Run Lighthouse 3 more times in an incognito window and compare. If the latency stays consistently above 700 ms, there may be a server-side performance issue on Vercel to investigate.

---

## 🛠️ Updated Prioritized Action Plan

| Priority | Action | File to Edit | Effort | Expected Impact |
|---|---|---|---|---|
| 🥇 1 | Add `priority` prop to first LCP `<Image>` | Article card component | 2 min | −1.5 to 2 s LCP |
| 🥈 2 | Enable `optimizeCss: true` in next.config.js + install `critters` | `next.config.js` | 5 min | −100–150 ms FCP |
| 🥉 3 | Re-run Lighthouse 3× to verify critical path latency | — | 10 min | Baseline confirmation |

---

## 🎯 Expected Results After These Fixes

| Metric | v1 | v2 (Current) | After Remaining Fixes |
|---|---|---|---|
| FCP | 3.7 s | Unknown | ~1.5–2.0 s 🟡 |
| LCP | 6.4 s | Unknown | ~2.0–3.0 s 🟡→🟢 |
| Speed Index | 5.5 s | Unknown | ~2.5–3.5 s 🟡 |
| TBT | 0 ms | 0 ms 🟢 | 0 ms 🟢 |
| CLS | 0 | 0 🟢 | 0 🟢 |

---

## 📚 References

- [Next.js Image `priority` prop](https://nextjs.org/docs/app/api-reference/components/image#priority)
- [Next.js `optimizeCss`](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizeCss)
- [Optimize LCP — Chrome Developers](https://developer.chrome.com/docs/performance/insights/lcp-discovery)
- [Eliminate Render-Blocking Resources — Lighthouse](https://developer.chrome.com/docs/lighthouse/performance/render-blocking-resources/)
- [Web Vitals — web.dev](https://web.dev/vitals/)

---

## Latest Performance/RPM Update - 2026-06-20

The ad-loading strategy was adjusted for RPM while still protecting Core Web
Vitals:

- The top ad loads eagerly.
- Lower ads do not all load at first render.
- Lower ads start loading before they enter the viewport using a generous
  `IntersectionObserver` root margin.
- Reserved ad heights remain in place to avoid layout shift.
- Global AdSense script loads from static app configuration in the root layout
  with native `<script async ...>`, avoiding the Next.js `data-nscript`
  attribute warning while keeping the publisher ID controlled by the app.
- Local development suppresses real AdSense requests; production keeps the
  static publisher and slot IDs.

Why this helps:

- Loading every ad immediately can hurt speed and Core Web Vitals.
- Loading ads only when fully visible can reduce fill and RPM because the ad
  request may be too late.
- Loading lower ads shortly before scroll arrival is the middle approach:
  better monetization timing with less first-load pressure.

Next RPM/performance checks:

1. Deploy the latest code to Vercel.
2. Re-run PageSpeed on mobile after deployment.
3. Check AdSense report by placement.
4. If all placements currently use one ad slot, create separate static AdSense
   ad units for top, middle, sidebar, in-article, after-content, and bottom so
   RPM can be measured per placement.
