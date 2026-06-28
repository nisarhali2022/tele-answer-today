import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  AD_SLOTS,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
  SITE_CONFIG,
} from '@/lib/constants'

export default function AdInArticle() {
  const isConfigured =
    isAdSenseEnabled() &&
    SITE_CONFIG.googleAdsenseId &&
    hasConfiguredAdSlot(AD_SLOTS.IN_ARTICLE)

  if (!isConfigured) return null

  return (
    <div
      className="my-8 clear-both"
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit slot={AD_SLOTS.IN_ARTICLE} format="fluid" />
    </div>
  )
}
