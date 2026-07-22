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

export const AD_PLACEMENTS = {
  top: {
    format: 'auto',
    eager: true,
    wrapperClassName: 'min-h-[100px] md:min-h-[90px]',
    loadingClassName: 'min-h-[100px] md:min-h-[90px]',
    emptyTimeout: 10000,
  },
  mid: {
    format: 'auto',
    eager: false,
    wrapperClassName: 'min-h-[100px] md:min-h-[250px]',
    loadingClassName: 'min-h-[100px] md:min-h-[250px]',
    emptyTimeout: 10000,
  },
  'in-article': {
    format: 'auto',
    eager: false,
    wrapperClassName: 'mx-auto min-h-[250px] max-w-[336px] md:max-w-none',
    loadingClassName: 'min-h-[250px]',
    emptyTimeout: 10000,
  },
  sidebar: {
    format: 'auto',
    eager: false,
    wrapperClassName: 'mx-auto min-h-[250px] max-w-[336px]',
    loadingClassName: 'min-h-[250px]',
    emptyTimeout: 10000,
  },
  'after-content': {
    format: 'auto',
    eager: false,
    wrapperClassName: 'min-h-[100px] md:min-h-[250px]',
    loadingClassName: 'min-h-[100px] md:min-h-[250px]',
    emptyTimeout: 10000,
  },
  bottom: {
    format: 'auto',
    eager: false,
    wrapperClassName: 'min-h-[100px] md:min-h-[250px]',
    loadingClassName: 'min-h-[100px] md:min-h-[250px]',
    emptyTimeout: 10000,
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
