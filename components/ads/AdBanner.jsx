import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  AD_PLACEMENTS,
  AD_SLOTS,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
  SITE_CONFIG,
} from '@/lib/constants'

export default function AdBanner({
  position = 'top',
  slot,
  className = '',
  eager,
}) {
  const placement = AD_PLACEMENTS[position] || AD_PLACEMENTS.top
  const resolvedSlot = slot || placement.slot || AD_SLOTS.TOP_LEADERBOARD
  const shouldLoadEagerly = eager ?? placement.eager ?? position === 'top'
  const isConfigured =
    isAdSenseEnabled() &&
    SITE_CONFIG.googleAdsenseId &&
    hasConfiguredAdSlot(resolvedSlot)

  if (!isConfigured) return null

  return (
    <div
      className={`my-6 w-full overflow-hidden ${placement.wrapperClassName || ''} ${className}`.trim()}
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit
        slot={resolvedSlot}
        format={placement.format || 'auto'}
        eager={shouldLoadEagerly}
        loadingClassName={placement.loadingClassName}
        emptyTimeout={placement.emptyTimeout}
        collapseWhenEmpty={position !== 'top'}
      />
    </div>
  )
}
