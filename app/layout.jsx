import { Inter } from 'next/font/google'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { isAdSenseEnabled, SITE_CONFIG } from '@/lib/constants'
import { getSiteSettings } from '@/lib/cms'
import { getAdSenseSettings } from '@/lib/cms/adsense'
import { AdSettingsProvider } from '@/components/ads/AdSettingsProvider'
import { serializeJsonLd } from '@/lib/schema'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — Get Daily Quiz Answers & Win Free Internet`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      {
        url: SITE_CONFIG.faviconUrl,
        type: 'image/png',
        sizes: '512x512',
      },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  openGraph: {
    siteName: SITE_CONFIG.name,
    locale: 'en_PK',
    type: 'website',
    images: [{ url: SITE_CONFIG.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: SITE_CONFIG.googleSiteVerification,
  },
}

export default async function RootLayout({ children }) {
  let siteSettings = null
  try {
    siteSettings = await getSiteSettings()
  } catch (error) {
    console.error('Unable to fetch CMS site settings', error)
  }
  const adsense = getAdSenseSettings(siteSettings)
  const organizationId = `${SITE_CONFIG.siteUrl}/#organization`
  const websiteId = `${SITE_CONFIG.siteUrl}/#website`
  const organizationLogoUrl = new URL('/icon.png', SITE_CONFIG.siteUrl).toString()
  const siteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: organizationLogoUrl,
          width: 512,
          height: 512,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: SITE_CONFIG.siteUrl,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        inLanguage: 'en-PK',
        publisher: { '@id': organizationId },
      },
    ],
  }

  return (
    <html lang="en-PK" className={inter.variable}>
      <body className="font-body bg-white text-text-primary">
        {isAdSenseEnabled() && adsense.enabled && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`}
            crossOrigin="anonymous"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteSchema) }}
        />
        <AdSettingsProvider settings={siteSettings}>
          <Header />
          <main id="main" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AdSettingsProvider>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${SITE_CONFIG.googleAnalyticsId}');
          `}
        </Script>
      </body>
    </html>
  )
}
