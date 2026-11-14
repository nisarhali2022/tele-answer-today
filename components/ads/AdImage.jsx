'use client'

import { useState } from 'react'
import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  ADSENSE_PUBLISHER_ID,
  getAdSlot,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
} from '@/lib/constants'

// Fixed-size display ad (300x250, 160x600, ...). Fixed sizes favour image
// creatives over the text/native look of responsive units.
export default function AdImage({
  width = 300,
  height = 250,
  slot = getAdSlot('display'),
  eager = false,
  className = '',
}) {
  const [status, setStatus] = useState('idle')

  // Hide the label and reserved box too when Google has no ad to show.
  if (!isAdSenseEnabled() || !hasConfiguredAdSlot(slot) || status === 'empty') {
    return null
  }

  return (
    <div
      className={`ad-image clear-both flex max-w-full flex-col items-center overflow-hidden ${className}`.trim()}
      aria-label="Advertisement"
    >
      <span className="mb-1 text-[11px] uppercase tracking-wide text-text-secondary">
        Advertisement
      </span>
      <div style={{ width: `${width}px`, maxWidth: '100%', minHeight: `${height}px` }}>
        <LazyAdSenseUnit
          slot={slot}
          publisherId={ADSENSE_PUBLISHER_ID}
          format={null}
          fullWidthResponsive={false}
          eager={eager}
          loadingClassName=""
          emptyTimeout={10000}
          style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
          onStatusChange={setStatus}
        />
      </div>
    </div>
  )
}
