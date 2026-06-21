import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  AD_SLOTS,
  hasConfiguredAdSlot,
  SITE_CONFIG,
} from '@/lib/constants'

export default function AdInArticle() {
  const isConfigured =
    SITE_CONFIG.googleAdsenseId &&
    !SITE_CONFIG.googleAdsenseId.includes('XXXX') &&
    hasConfiguredAdSlot(AD_SLOTS.IN_ARTICLE)

  if (!isConfigured) return null

  return (
    <div
      className="my-8 min-h-[250px] clear-both"
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit slot={AD_SLOTS.IN_ARTICLE} format="fluid" />
    </div>
  )
}
