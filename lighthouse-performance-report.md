# 🚦 Lighthouse Performance Audit Report
**URL:** `https://tele-answer-today.vercel.app`  
**Audit Type:** Core Web Vitals & Performance Insights

> **Historical report:** This audit predates the June 19, 2026 headless
> migration and performance updates. Its recommendation to prioritize the first
> Latest News image was superseded after runtime measurement. Duplicate/custom
> news-image preloading was removed, fixed WordPress-upload assets were moved
> into `public/assets/`, the CSS bundle was reduced by replacing Tailwind
> Typography with compact custom `.prose` CSS, and route-specific homepage
> JavaScript is now approximately `628 B`. Use `PROJECT_OVERVIEW.md` and
> `SEO_ANALYSIS.md` for current status.
>
> **Follow-up note, June 25, 2026:** mobile empty AdSense slots now collapse,
> and WordPress tables now scroll horizontally inside `.wp-table-scroll`
> wrappers. Re-run Lighthouse on the deployed production build before using the
> metrics below for current performance decisions.
>
> **Follow-up note, June 28, 2026:** WordPress-backed images now keep canonical
> WordPress media URLs and bypass Vercel `/_next/image` proxying. Next image
> qualities `60`, `70`, and `75` are configured, and AdSense is disabled during
> local development to avoid localhost ad-request `403` noise.

---

## 📊 Core Metrics Overview

| Metric | Value | Status | Threshold (Good) |
|---|---|---|---|
| First Contentful Paint (FCP) | 3.7 s | 🔴 Poor | < 1.8 s |
| Largest Contentful Paint (LCP) | 6.4 s | 🔴 Poor | < 2.5 s |
| Total Blocking Time (TBT) | 0 ms | 🟢 Good | < 200 ms |
| Cumulative Layout Shift (CLS) | 0 | 🟢 Good | < 0.1 |
| Speed Index | 5.5 s | 🔴 Poor | < 3.4 s |

> **Summary:** The page has excellent interactivity (TBT) and layout stability (CLS), but suffers significantly on visual load speed — primarily driven by a slow LCP and FCP. These are the priority areas to fix.

---

## 🔍 Issue Breakdown & Fixes

---

### Issue 1 — LCP Request Discovery (Unscored)

**Severity:** 🔴 High  
**Affected Metric:** LCP (6.4 s)

#### What's Wrong
The Largest Contentful Paint element is an `<img>` tag that:
- Uses `loading="lazy"` — telling the browser to **delay** loading it
- Does **not** have `fetchpriority="high"` — so the browser doesn't know it's critical
- Is not discoverable from the initial HTML (likely injected by JavaScript or a framework)

**Offending Element:**
```html
<!-- ❌ Current (problematic) -->
<img
  alt="Qualcomm Targets 2029 for 6G Global Rollout…"
  loading="lazy"
  decoding="async"
  data-nimg="fill"
  class="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  srcset="/_next/image?url=..."
  src="https://tele-answer-today.vercel.app/_next/image?url=..."
/>
```

#### ✅ Fix

```html
<!-- ✅ Fixed -->
<img
  alt="Qualcomm Targets 2029 for 6G Global Rollout…"
  loading="eager"
  fetchpriority="high"
  decoding="sync"
  class="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  srcset="/_next/image?url=..."
  src="https://tele-answer-today.vercel.app/_next/image?url=..."
/>
```

**Changes made:**
- `loading="lazy"` → `loading="eager"` (or removed entirely — `eager` is the default)
- Added `fetchpriority="high"` to signal this is the most important image
- `decoding="async"` → `decoding="sync"` for LCP images (avoids decode delay)

#### Next.js-Specific Workaround
Since this is a **Next.js** project using `next/image` (`data-nimg="fill"`), use the `priority` prop:

```jsx
// ❌ Current
<Image
  src="..."
  alt="..."
  fill
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// ✅ Fixed — add priority prop
<Image
  src="..."
  alt="..."
  fill
  priority              // ← This sets fetchpriority=high and loading=eager automatically
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

> **Note:** Only add `priority` to the **above-the-fold** hero/LCP image. Don't apply it to all images.

---

### Issue 2 — Network Dependency Chain (Unscored)

**Severity:** 🟡 Medium  
**Affected Metric:** LCP, FCP  
**Maximum Critical Path Latency:** 408 ms

#### What's Wrong
The browser must wait for a chain of dependent resources before rendering:

```
Initial Navigation (254 ms, 17.50 KiB)
  └── /css/58e779...ae93.css (408 ms, 9.66 KiB)
```

The CSS file is a **render-blocking** resource — the page cannot paint until it's downloaded, which adds 408 ms to the critical path.

#### ✅ Fixes

**Option A — Inline Critical CSS**  
Extract the CSS needed for above-the-fold content and inline it in `<head>`:

```html
<head>
  <!-- Inline only critical above-the-fold styles -->
  <style>
    /* Critical CSS for hero/LCP element */
    .hero-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    /* ... other above-fold styles ... */
  </style>

  <!-- Load full CSS non-blocking -->
  <link rel="preload" href="/css/58e779...ae93.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/58e779...ae93.css"></noscript>
</head>
```

**Option B — Preload the CSS**  
Tell the browser to start fetching the CSS earlier:

```html
<head>
  <link rel="preload" href="/_next/static/css/58e779588926ae93.css" as="style" />
  <link rel="stylesheet" href="/_next/static/css/58e779588926ae93.css" />
</head>
```

**Option C — Next.js Configuration**  
In `next.config.js`, optimize CSS handling:

```js
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,  // Enables critical CSS extraction (requires critters)
  },
}
```

Install the dependency:
```bash
npm install critters
```

---

### Issue 3 — Reduce Unused JavaScript (Est. Savings: 154 KiB)

**Severity:** 🔴 High  
**Affected Metrics:** LCP, FCP  

#### What's Wrong

Google AdSense scripts are loading **222 KiB** of JavaScript, of which **154 KiB is unused** on initial load:

| Script | Transfer Size | Unused | % Wasted |
|---|---|---|---|
| `show_ads_impl_fy2021.js` | 168.1 KiB | 126.5 KiB | 75% |
| `adsbygoogle.js` | 53.8 KiB | 27.7 KiB | 51% |
| **Total** | **222 KiB** | **154.2 KiB** | **69%** |

These scripts are loaded **eagerly** on every page, blocking FCP and LCP even on pages where ads may not be visible.

#### ✅ Fixes

**Historical option — delayed AdSense loading**  
This was an earlier performance idea. It is superseded by the current static
native script plus near-viewport placement loading approach documented below:

```html
<!-- ❌ Current — loads immediately, blocks rendering -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>

<!-- ✅ Option 1: Load after page interaction -->
<script>
  window.addEventListener('load', function() {
    setTimeout(function() {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }, 3000); // 3-second delay after load
  });
</script>
```

**Historical option — load the global script on scroll**

```javascript
// Load AdSense only when an ad slot enters the viewport
const adSlots = document.querySelectorAll('.adsbygoogle');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadAdSense(); // Load the script once
      observer.disconnect();
    }
  });
}, { rootMargin: '200px' }); // Start loading 200px before visible

adSlots.forEach(slot => observer.observe(slot));

function loadAdSense() {
  if (window.adsbygoogleLoaded) return;
  window.adsbygoogleLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX';
  s.async = true;
  document.head.appendChild(s);
}
```

**Current project approach — Static native AdSense script**

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9444471613078101" crossorigin="anonymous"></script>
```

The publisher ID and slot IDs are static app configuration, not WordPress
content. Native script loading avoids the Next.js `data-nscript` attribute
warning from AdSense. Local development suppresses real ad requests; production
keeps static AdSense loading.

> ⚠️ **Important:** Lazy-loading ads may slightly reduce ad viewability metrics. Test the impact on ad revenue before deploying. Most cases see negligible revenue impact with significant performance gains.

---

## 🛠️ Prioritized Action Plan

| Priority | Issue | Effort | Est. LCP Improvement |
|---|---|---|---|
| 🥇 1 | Add `priority` to LCP `<Image>` component | Very Low (1 line) | ~1–2 s |
| 🥈 2 | Keep native static AdSense script and near-viewport lower-ad loading | Done | ~0.5–1 s |
| 🥉 3 | Preload or inline critical CSS | Medium (30 min) | ~0.3–0.5 s |

---

## 🎯 Expected Results After Fixes

| Metric | Current | Expected After Fixes |
|---|---|---|
| FCP | 3.7 s | ~1.5–2.0 s 🟡 |
| LCP | 6.4 s | ~2.0–3.0 s 🟡→🟢 |
| Speed Index | 5.5 s | ~2.5–3.5 s 🟡 |
| TBT | 0 ms | 0 ms 🟢 (unchanged) |
| CLS | 0 | 0 🟢 (unchanged) |

---

## 📚 References

- [Optimize LCP — Chrome Developers](https://developer.chrome.com/docs/performance/insights/lcp-discovery)
- [Network Dependency Tree — Lighthouse](https://developer.chrome.com/docs/performance/insights/network-dependency-tree)
- [Reduce Unused JavaScript — Lighthouse](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image#priority)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [Web Vitals — web.dev](https://web.dev/vitals/)

---

## Latest Performance Update - 2026-06-20

Recent PageSpeed screenshot showed:

| Area | Score |
| --- | --- |
| Performance | 89 |
| Accessibility | 98 |
| Best Practices | 81 |
| SEO | 100 |

Latest implemented changes:

- AdSense global script now loads from static app configuration in the root
  layout with native `<script async ...>`, avoiding the Next.js `data-nscript`
  attribute warning.
- Top ad placement loads eagerly so the first monetization opportunity is not
  delayed.
- Lower, sidebar, and in-article ad placements lazy-load through
  `IntersectionObserver`.
- Lazy ad loading uses an early viewport margin so ads can request before the
  user reaches them, which is better for RPM than waiting until the ad is fully
  visible.
- Ad containers reserve height to protect CLS.
- Mobile horizontal overflow was fixed.

Remaining validation:

- Re-run PageSpeed after the latest deployment.
- Compare LCP/CLS with ads active and with real mobile network throttling.
- If performance drops, reduce lower-ad preload distance or move noncritical
  placements farther below the fold.
