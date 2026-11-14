export const SITE_CONFIG = {
  name: 'Tele Answer Today',
  siteName: 'Tele Answer Today',
  tagline: "Get today's Telenor quiz answers and win free internet data daily",
  description:
    'Telenor Quiz Today Get all correct answers. Check daily updated questions and My Telenor answers today to boost your score and win rewards.',
  url: 'https://teleanswertoday.pk',
  siteUrl: 'https://teleanswertoday.pk',
  locale: 'en_PK',
  defaultOgImage: '/assets/tele-answer-today-og.webp',
  logoUrl: '/assets/tele-answer-today.webp',
  faviconUrl: '/assets/tele-answer-today-favicon.png',
  googleAnalyticsId: 'G-Q6NJ8N20FV',
  googleSiteVerification: 'Umy1DY5Vngn0XLt29V2gpg8Y7unQq6oF4tiW_fhoGnA',
  postsPerPage: 10,
  revalidateTime: 3600,
}

export const NAV_LINKS = [
  { label: 'Telenor Answer Today', href: '/' },
  {
    label: 'Telenor Packages',
    href: '/telenor/telenor-packages',
    children: [
      { label: 'Telenor SMS Packages', href: '/telenor/telenor-sms-packages' },
      { label: 'Telenor Call Packages', href: '/telenor/telenor-call-packages' },
      { label: 'Telenor Internet Packages', href: '/telenor/telenor-internet-packages' },
    ],
  },
  {
    label: 'Telenor Codes',
    href: '/telenor/telenor-codes',
    children: [
      { label: 'Telenor Number Check Code', href: '/telenor/telenor-number-check-code' },
      { label: 'Telenor Load Reversal Code', href: '/telenor/telenor-load-reversal-code' },
      { label: 'Telenor Balance Save Code', href: '/telenor/telenor-balance-save-code' },
      { label: 'Telenor Balance Check Code', href: '/telenor/telenor-balance-check-code' },
      { label: 'how to get telenor loan', href: '/telenor/how-to-get-telenor-loan' },
    ],
  },
  { label: 'Telecom', href: '/telecom' },
  { label: 'Global', href: '/global' },
  { label: 'Tech', href: '/tech' },
  { label: 'News & Blog', href: '/blog' },
]

export const EXCLUDED_CONTENT_SLUGS = ['telenor-answer-today', 'daily-quiz']

export const HOME_CONTENT_REDIRECT_SLUGS = ['telenor-answer-today']

// AdSense is configured here in code, not in the CMS. Change a slot ID here
// and redeploy. `public/ads.txt` must list the same publisher.
export const ADSENSE_PUBLISHER_ID = 'ca-pub-9444471613078101'

export const AD_SLOTS = {
  // "tele answer" responsive display unit. Banners use it responsively; image
  // ads use it at a fixed size (300x250, 160x600).
  DISPLAY: '4789150646',
  // Multiplex ("autorelaxed") unit below Related Posts.
  MULTIPLEX: '8537280112',
}

export const AD_POSITIONS = {
  top: AD_SLOTS.DISPLAY,
  mid: AD_SLOTS.DISPLAY,
  bottom: AD_SLOTS.DISPLAY,
  'after-content': AD_SLOTS.DISPLAY,
  sidebar: AD_SLOTS.DISPLAY,
  display: AD_SLOTS.DISPLAY,
  multiplex: AD_SLOTS.MULTIPLEX,
}

export function getAdSlot(position) {
  return AD_POSITIONS[position] || AD_SLOTS.DISPLAY
}

export const AD_PLACEMENTS = {
  top: {
    format: 'auto',
    eager: true,
    wrapperClassName: 'min-h-[100px] md:min-h-[90px]',
    loadingClassName: 'min-h-[100px] md:min-h-[90px]',
  },
  mid: {
    format: 'auto',
    eager: false,
    wrapperClassName: 'min-h-[100px] md:min-h-[250px]',
    loadingClassName: 'min-h-[100px] md:min-h-[250px]',
  },
  'in-article': {
    format: 'auto',
    eager: false,
    wrapperClassName: 'mx-auto min-h-[250px] max-w-[336px] md:max-w-none',
    loadingClassName: 'min-h-[250px]',
  },
  sidebar: {
    format: 'auto',
    eager: false,
    wrapperClassName: 'mx-auto min-h-[250px] max-w-[336px]',
    loadingClassName: 'min-h-[250px]',
  },
  'after-content': {
    format: 'auto',
    eager: false,
    wrapperClassName: 'min-h-[100px] md:min-h-[250px]',
    loadingClassName: 'min-h-[100px] md:min-h-[250px]',
  },
  bottom: {
    format: 'auto',
    eager: false,
    wrapperClassName: 'min-h-[100px] md:min-h-[250px]',
    loadingClassName: 'min-h-[100px] md:min-h-[250px]',
  },
}

export function hasConfiguredAdSlot(slot) {
  return Boolean(slot) && !/^(\d)\1{9}$/.test(String(slot))
}

export function isAdSenseEnabled() {
  return (
    process.env.NODE_ENV !== 'development' &&
    process.env.DISABLE_ADSENSE !== 'true'
  )
}

export const CATEGORY_COLORS = [
  'bg-primary',
  'bg-accent',
  'bg-emerald-700',
  'bg-sky-700',
  'bg-rose-700',
  'bg-violet-700',
  'bg-cyan-700',
  'bg-slate-700',
]
