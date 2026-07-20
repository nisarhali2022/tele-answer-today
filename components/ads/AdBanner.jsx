'use client'

import LazyAdSenseUnit from './LazyAdSenseUnit'
import { AD_PLACEMENTS, hasConfiguredAdSlot, isAdSenseEnabled } from '@/lib/constants'
import { getAdSenseSettings, getAdSenseSlot } from '@/lib/cms/adsense'
import { useAdSettings } from './AdSettingsProvider'

export default function AdBanner({
  position = 'top',
  slot,
  className = '',
  eager,
}) {
  const settings = useAdSettings()
  const adsense = getAdSenseSettings(settings)
  const placement = AD_PLACEMENTS[position] || AD_PLACEMENTS.top
  const resolvedSlot = slot || getAdSenseSlot(settings, position)
  const shouldLoadEagerly = eager ?? placement.eager ?? position === 'top'
  const isConfigured =
    isAdSenseEnabled() &&
    adsense.enabled &&
    hasConfiguredAdSlot(resolvedSlot)

  if (!isConfigured) return null

  return (
    <div
      className={`my-6 w-full overflow-hidden ${placement.wrapperClassName || ''} ${className}`.trim()}
      aria-label="Advertisement"
    >
        <LazyAdSenseUnit
          slot={resolvedSlot}
          publisherId={adsense.publisherId}
        format={placement.format || 'auto'}
        eager={shouldLoadEagerly}
        loadingClassName={placement.loadingClassName}
        emptyTimeout={placement.emptyTimeout}
        collapseWhenEmpty={position !== 'top'}
      />
    </div>
  )
}
