'use client'

import { useState } from 'react'
import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  ADSENSE_PUBLISHER_ID,
  AD_PLACEMENTS,
  getAdSlot,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
} from '@/lib/constants'

// Horizontal banners (top/bottom of a page) reserve a short leaderboard-sized
// space instead of the taller box of the in-page responsive banners.
const HORIZONTAL_SIZE = 'min-h-[100px] md:min-h-[90px]'

export default function AdBanner({
  position = 'top',
  slot,
  className = '',
  eager,
  variant = 'responsive',
}) {
  const [status, setStatus] = useState('idle')
  const placement = AD_PLACEMENTS[position] || AD_PLACEMENTS.top
  const resolvedSlot = slot || getAdSlot(position)
  const shouldLoadEagerly = eager ?? placement.eager ?? position === 'top'
  const isHorizontal = variant === 'horizontal'

  // Every banner, including the top one, collapses (wrapper and all) when
  // Google has no ad, so an empty slot never leaves a blank gap.
  if (!isAdSenseEnabled() || !hasConfiguredAdSlot(resolvedSlot) || status === 'empty') {
    return null
  }

  const wrapperSize = isHorizontal ? HORIZONTAL_SIZE : placement.wrapperClassName || ''
  const loadingSize = isHorizontal ? HORIZONTAL_SIZE : placement.loadingClassName

  return (
    <div
      className={`my-6 w-full overflow-hidden ${wrapperSize} ${className}`.trim()}
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit
        slot={resolvedSlot}
        publisherId={ADSENSE_PUBLISHER_ID}
        format={isHorizontal ? 'horizontal' : placement.format || 'auto'}
        eager={shouldLoadEagerly}
        loadingClassName={loadingSize}
        onStatusChange={setStatus}
      />
    </div>
  )
}
