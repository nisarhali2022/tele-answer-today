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
  logoUrl: '/assets/tele-answer-today-logo.webp',
  faviconUrl: '/assets/tele-answer-today-favicon.png',
  googleAnalyticsId: 'G-Q6NJ8N20FV',
  googleAdsenseId: 'ca-pub-9444471613078101',
  googleSiteVerification: 'Umy1DY5Vngn0XLt29V2gpg8Y7unQq6oF4tiW_fhoGnA',
  postsPerPage: 10,
  revalidateTime: 3600,
}

export const NAV_LINKS = [
  { label: 'Telenor Answer Today', href: '/' },
  {
    label: 'Telenor Packages',
    href: '/telenor/telenor-packages/',
    children: [
      { label: 'Telenor SMS Packages', href: '/telenor/telenor-sms-packages/' },
      { label: 'Telenor Call Packages', href: '/telenor/telenor-call-packages/' },
      { label: 'Telenor Internet Packages', href: '/telenor/telenor-internet-packages/' },
    ],
  },
  {
    label: 'Telenor Codes',
    href: '/telenor/telenor-codes/',
    children: [
      { label: 'Telenor Number Check Code', href: '/telenor/telenor-number-check-code/' },
      { label: 'Telenor Load Reversal Code', href: '/telenor/telenor-load-reversal-code/' },
      { label: 'Telenor Balance Save Code', href: '/telenor/telenor-balance-save-code/' },
      { label: 'Telenor Balance Check Code', href: '/telenor/telenor-balance-check-code/' },
      { label: 'how to get telenor loan', href: '/telenor/how-to-get-telenor-loan/' },
    ],
  },
  { label: 'Telecom', href: '/telecom' },
  { label: 'Global', href: '/global' },
  { label: 'Tech', href: '/tech' },
  { label: 'News & Blog', href: '/blog' },
]

export const HOME_PAGE_SLUG = 'telenor-answer-today'

export const EXCLUDED_CONTENT_SLUGS = [HOME_PAGE_SLUG, 'daily-quiz']

export const LEGACY_HOME_REDIRECT_SLUGS = [HOME_PAGE_SLUG]

export const AD_SLOTS = {
  TOP_LEADERBOARD: '4789150646',
  BELOW_HEADER: '4789150646',
  IN_ARTICLE: '4789150646',
  SIDEBAR: '4789150646',
  AFTER_CONTENT: '4789150646',
  BOTTOM: '4789150646',
}

export const AD_POSITIONS = {
  top: AD_SLOTS.TOP_LEADERBOARD,
  mid: AD_SLOTS.BELOW_HEADER,
  bottom: AD_SLOTS.BOTTOM,
  'after-content': AD_SLOTS.AFTER_CONTENT,
}

export function hasConfiguredAdSlot(slot) {
  return Boolean(slot) && !/^(\d)\1{9}$/.test(String(slot))
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
