'use client'

import { useState } from 'react'
import LazyAdSenseUnit from './LazyAdSenseUnit'
import {
  ADSENSE_PUBLISHER_ID,
  getAdSlot,
  hasConfiguredAdSlot,
  isAdSenseEnabled,
} from '@/lib/constants'

// Multiplex ("autorelaxed") grid of recommended-content ads, end of articles.
export default function AdMultiplex() {
  const [status, setStatus] = useState('idle')
  const slot = getAdSlot('multiplex')

  // The whole block disappears when Google has no ad, so no gap is left.
  if (!isAdSenseEnabled() || !hasConfiguredAdSlot(slot) || status === 'empty') {
    return null
  }

  return (
    // The reserved height gives the lazy loader a visible box to observe; a
    // 0px box inside overflow-hidden never counts as on screen.
    <div className="my-8 min-h-[300px] w-full overflow-hidden" aria-label="Advertisement">
      <LazyAdSenseUnit
        slot={slot}
        publisherId={ADSENSE_PUBLISHER_ID}
        format="autorelaxed"
        fullWidthResponsive={false}
        loadingClassName=""
        onStatusChange={setStatus}
      />
    </div>
  )
}
