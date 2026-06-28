import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  AD_PLACEMENTS,
  AD_SLOTS,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
  SITE_CONFIG,
} from '@/lib/constants'

export default function AdInArticle() {
  const placement = AD_PLACEMENTS['in-article']
  const isConfigured =
    isAdSenseEnabled() &&
    SITE_CONFIG.googleAdsenseId &&
    hasConfiguredAdSlot(placement?.slot || AD_SLOTS.IN_ARTICLE)

  if (!isConfigured) return null

  return (
    <div
      className={`my-8 clear-both ${placement.wrapperClassName}`}
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit
        slot={placement.slot}
        format={placement.format}
        loadingClassName={placement.loadingClassName}
        emptyTimeout={placement.emptyTimeout}
      />
    </div>
  )
}
