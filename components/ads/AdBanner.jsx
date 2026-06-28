import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  AD_POSITIONS,
  AD_SLOTS,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
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
    isAdSenseEnabled() &&
    SITE_CONFIG.googleAdsenseId &&
    hasConfiguredAdSlot(resolvedSlot)

  if (!isConfigured) return null

  return (
    <div
      className={`my-6 w-full overflow-hidden ${className}`}
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit slot={resolvedSlot} format="auto" eager={eager} />
    </div>
  )
}
