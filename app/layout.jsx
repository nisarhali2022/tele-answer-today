import { Inter } from 'next/font/google'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SITE_CONFIG } from '@/lib/constants'
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
    icon: SITE_CONFIG.faviconUrl,
    shortcut: SITE_CONFIG.faviconUrl,
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

export default function RootLayout({ children }) {
  const hasAdSenseClient =
    SITE_CONFIG.googleAdsenseId &&
    !SITE_CONFIG.googleAdsenseId.includes('XXXX')
  const organizationId = `${SITE_CONFIG.siteUrl}/#organization`
  const websiteId = `${SITE_CONFIG.siteUrl}/#website`
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
          url: SITE_CONFIG.logoUrl,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteSchema) }}
        />
        <Header />
        <main id="main" className="min-h-screen">
          {children}
        </main>
        <Footer />
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
        {hasAdSenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.googleAdsenseId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  )
}
