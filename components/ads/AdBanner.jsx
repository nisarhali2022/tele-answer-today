import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  AD_POSITIONS,
  AD_SLOTS,
  hasConfiguredAdSlot,
  SITE_CONFIG,
} from '@/lib/constants'

export default function AdBanner({
  position = 'top',
  slot,
  className = '',
  eager = position === 'top',
}) {
  const resolvedSlot = slot || AD_POSITIONS[position] || AD_SLOTS.TOP_LEADERBOARD
  const isConfigured =
    SITE_CONFIG.googleAdsenseId &&
    !SITE_CONFIG.googleAdsenseId.includes('XXXX') &&
    hasConfiguredAdSlot(resolvedSlot)

  if (!isConfigured) return null

  return (
    <div
      className={`my-6 min-h-[250px] w-full overflow-hidden sm:min-h-[120px] ${className}`}
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit slot={resolvedSlot} format="auto" eager={eager} />
    </div>
  )
}
