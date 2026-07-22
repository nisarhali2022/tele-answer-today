# Core Web Vitals Optimization Tracker

Created: 2026-07-23

Site: `https://teleanswertoday.pk`

## Working Agreement

Tasks are handled one at a time. Before starting the next task, the current
task must be implemented, tested, deployed, measured in production, and
reviewed with the site owner. This file is updated as work progresses.

Status values:

```text
Planned
Approved
In Progress
Implemented Locally
Deployed
Monitoring
Complete
Blocked
```

## Baseline

### Historical Field Data

| Metric | Result | Target |
| --- | ---: | ---: |
| LCP | 3.8s | <= 2.5s |
| INP | 395ms | <= 200ms |
| CLS | 0 | <= 0.1 |
| FCP | 3.5s | <= 1.8s |
| TTFB | 1.5s | <= 0.8s |

Field data includes visits from before the latest cache deployment and may
take approximately 2-4 weeks to reflect recent changes.

### Current Lab and Production Evidence

| Measurement | Result |
| --- | ---: |
| Vercel cache | `HIT` with increasing `Age` |
| Cached Lighthouse server response | Approximately 60-62ms |
| Desktop Lighthouse | 98 |
| Desktop FCP / LCP / TBT / CLS | 0.7s / 0.8s / 50ms / 0.002 |
| Good mobile Lighthouse | 96 |
| Good mobile FCP / LCP / TBT / CLS | 1.1s / 2.5s / 160ms / 0.004 |
| Slow mobile Lighthouse | 59 |
| Slow mobile FCP / LCP / TBT / CLS | 2.2s / 3.3s / 3,100ms / 0.004 |
| Estimated avoidable CMS image transfer | Approximately 675KB |
| Average engagement time per active user | 21 seconds |

The production cache is functioning. Remaining mobile variability is primarily
associated with third-party advertising/consent work, large CMS images, and
main-thread rendering/hydration work.

## Locked Decisions

- Ad strategy: balanced mobile AdSense delay.
- Desktop AdSense behavior remains unchanged.
- Latest News and Recent Posts randomization will move to cache-refresh
  selection instead of client-side reshuffling on every reload.
- Custom real-user monitoring task was removed. Existing PageSpeed, Lighthouse,
  Search Console, GA4, and Vercel evidence will be used.
- Existing ISR/CDN caching remains because repeat requests are confirmed hits.
- SEO content, CMS ownership, quiz behavior, metadata, schema, canonicals, and
  signed revalidation must remain intact.

## Task 1: Defer Below-the-Fold Rendering

Status: `Complete`

Approval date: 2026-07-23

### Issue

- Slow mobile testing recorded approximately 2.81s of style and layout work.
- The homepage response is approximately 391KB of HTML.
- The existing informational component used one large deferred wrapper, while
  the Quick Guide, Steps, and CMS-authored post-news content were not covered.

### Changes

- Apply progressive `content-visibility: auto` treatment to informational
  sections after Latest News.
- Keep H1, introduction, Quick Summary, TOC, top ad, quiz, in-article ad, and
  Latest News immediately rendered.
- Give ordinary sections and long content blocks separate intrinsic-size
  estimates.
- Keep all content in server-rendered HTML; do not remove or lazy-fetch it.
- Keep mid/bottom ads outside the long deferred content container so their own
  viewport-lazy behavior remains independent.

### Expected Impact

- Small-to-medium reduction in initial style/layout work.
- Possible mobile TBT and INP improvement.
- No intended SEO, quiz, content, analytics, or ad-loading behavior change.

### Risks and Required Checks

- Lower-section placeholders must not cause visible jumps while scrolling.
- Direct hash links must reveal and scroll to lower H2/H3 targets.
- TOC IDs and fixed-header offsets must remain unchanged.

### Implementation Record

```text
Implementation date: 2026-07-23
Files changed: app/page.jsx, components/home/QuizInfoSections.jsx,
  components/home/StepsSection.jsx, styles/globals.css,
  test/homepage.test.js
Tests added: Homepage deferred-content placement/source coverage
Test result: 64/64 tests passed; lint passed; production build passed
Deployment date: 2026-07-23
Before mobile performance: 59-96
Before mobile LCP: 2.5-3.3s
Before mobile TBT: 160-3,100ms
After mobile run 1: Performance 74; FCP 1.3s; LCP 2.2s;
  TBT 1,260ms; CLS 0.004; Speed Index 2.4s
After diagnostic run 1: Main-thread work 4.6s; style/layout 659ms;
  script evaluation 2,493ms
Observed regressions: None; lower homepage sections and direct TOC hash links
  were manually verified in production
Final status: Complete; repeated mobile scores remained in the 60s, with the
  detailed run scoring 74
Notes: The normal .next directory was locked by the active local Next process,
  so the successful verification build used isolated NEXT_DIST_DIR output.
  The first deployed run improved substantially over the earlier slow mobile
  run: Performance 59 to 74, FCP 2.2s to 1.3s, LCP 3.3s to 2.2s, TBT 3,100ms
  to 1,260ms, Speed Index 4.1s to 2.4s, main-thread work 10.1s to 4.6s, and
  style/layout work 2,810ms to 659ms. The large style/layout reduction aligns
  with Task 1's intended effect, but third-party variation remains significant:
  this run still recorded about 1,305ms Google Ads CPU, 546ms Google Tag
  Manager CPU, and 532ms Funding Choices CPU. Additional mobile runs scored in
  the 60s. The site owner confirmed that lower sections and direct TOC links
  display correctly and approved continuing to Task 2.
```

## Task 2: Convert TOC to Native Disclosure

Status: `Implemented Locally`

Approval date: 2026-07-23

Replace the React state toggle with semantic `<details>` and `<summary>` while
preserving hierarchy, anchors, styling, accessibility, and fixed-header offset.

Expected impact: small JavaScript/hydration reduction and slight INP benefit.

### Implementation Record

```text
Implementation date: 2026-07-23
Files changed: components/posts/TableOfContents.jsx, test/homepage.test.js,
  CORE_WEB_VITALS_OPTIMIZATION_TRACKER.md
Tests added: Native disclosure, no client directive/state/click handler,
  default-expanded support, and disclosure icon state
Test result: 65/65 tests passed; lint passed; production build passed
Deployment date: Pending
Before homepage route / First Load JS: 2.04kB / 117kB
After homepage route / First Load JS: 1.52kB / 116kB
After Lighthouse metrics: Pending deployment
Observed regressions: None in automated verification; production TOC expand,
  collapse, anchor, and keyboard checks remain pending
Final status: Implemented Locally; deployment and monitoring pending
Notes: The TOC is now a Server Component using native details/summary markup.
  All full-title anchor links, indentation, defaultExpanded behavior, and the
  fixed-header anchor offset remain unchanged. The normal .next directory was
  locked by the active local dev process, so the successful build used the
  isolated .next-task2-verify directory.
```

## Task 3: Move Random Posts to Server Cache

Status: `Planned`

Keep the newest two Latest News cards fixed, choose four older cards on the
server, and select Recent Posts on the server. Selections change after cache
regeneration instead of through client effects on each reload.

Expected impact: small-to-medium hydration/TBT improvement and more stable
image rendering.

## Task 4: Delay Google Analytics Until Browser Idle

Status: `Planned`

Keep the static GA4 ID but use an idle/lazy loading strategy. Verify Realtime
reporting after deployment.

Expected impact: medium reduction in early JavaScript competition. Very short
visits may occasionally end before analytics initializes.

## Task 5: Balanced Mobile AdSense Delay

Status: `Planned`

Keep AdSense enabled and CMS-managed. Preserve current desktop behavior. On
mobile, initialize after window load and a short browser-idle opportunity,
then load the top unit first and keep lower placements viewport-lazy.

Evidence from the slow mobile run:

- Google Ads used approximately 3.2s CPU time.
- Ad script evaluation used approximately 2.08s.
- Funding Choices added approximately 1.09s CPU time.

Expected impact: largest likely mobile TBT/INP improvement. Monitor mobile
impressions, viewability, RPM, and page RPM for seven days after deployment.

## Task 6: Add Responsive Supabase Image Variants

Status: `Planned`

Add thumbnail, card, and featured-image variants through the CMS/Supabase media
flow. Use responsive variant URLs without restoring Vercel `/_next/image`
proxying for remote CMS images. Preserve original canonical media URLs for
metadata and image sitemaps.

Target variants:

| Usage | Target size |
| --- | --- |
| Sidebar thumbnail | Approximately 160x120 |
| Mobile news card | Approximately 640x360 |
| Desktop news card | Approximately 400x225 |
| Article featured image | Approximately 1200x675 |

Expected impact: approximately 675KB potential transfer reduction on the
measured homepage and faster image rendering.

## Task 7: Isolate CMS Ad Settings From the Page Shell

Status: `Planned`

Remove the ad-settings provider from around the complete application shell and
load settings only inside isolated ad/bootstrap components with cached server
data and a no-ad Suspense fallback.

Expected impact: protects uncached TTFB and reduces global client-context
hydration. This requires careful server/client boundary testing.

## Task 8: Reduce Homepage DOM and Style Cost

Status: `Planned`

Remove duplicated, empty, hidden, or unnecessary wrappers while preserving all
meaningful content, heading hierarchy, TOC entries, metadata, and schema. Do
not shorten or delete content without separate approval.

Expected impact: medium-to-large improvement on slower mobile devices. This is
the highest content/SEO regression-risk task and remains last.

## Verification Standard

Run after every implementation:

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

For deployed tasks:

1. Confirm repeat requests return `X-Vercel-Cache: HIT`.
2. Run three mobile PageSpeed tests and record the middle result.
3. Run one desktop PageSpeed test.
4. Record Performance, FCP, LCP, TBT, CLS, and Speed Index.
5. Test a real mobile device for layout and interaction regressions.
6. Stop for review before approving the next task.

Lab targets:

```text
Mobile performance: 90+
Mobile LCP: <= 2.5s
Mobile TBT: <= 200ms
Desktop performance: 95+
CLS: <= 0.1
Cached server response: <= 200ms
```

Field targets after sufficient visitor data:

```text
LCP: <= 2.5s
INP: <= 200ms
CLS: <= 0.1
FCP: <= 1.8s
TTFB: <= 0.8s
```

## Per-Task Result Template

```text
Status:
Approval date:
Implementation date:
Files changed:
Tests added:
Test result:
Deployment date:
Before Lighthouse metrics:
After Lighthouse metrics:
Ad revenue impact:
Analytics impact:
Observed regressions:
Final status:
Notes:
```
