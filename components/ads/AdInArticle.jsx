'use client'

import LazyAdSenseUnit from './LazyAdSenseUnit'
import { AD_PLACEMENTS, hasConfiguredAdSlot, isAdSenseEnabled } from '@/lib/constants'
import { getAdSenseSettings, getAdSenseSlot } from '@/lib/cms/adsense'
import { useAdSettings } from './AdSettingsProvider'

export default function AdInArticle() {
  const settings = useAdSettings()
  const adsense = getAdSenseSettings(settings)
  const placement = AD_PLACEMENTS['in-article']
  const slot = getAdSenseSlot(settings, 'in-article')
  const isConfigured =
    isAdSenseEnabled() &&
    adsense.enabled &&
    hasConfiguredAdSlot(slot)

  if (!isConfigured) return null

  return (
    <div
      className={`my-8 clear-both ${placement.wrapperClassName}`}
      aria-label="Advertisement"
    >
      <LazyAdSenseUnit
        slot={slot}
        publisherId={adsense.publisherId}
        format={placement.format}
        loadingClassName={placement.loadingClassName}
        emptyTimeout={placement.emptyTimeout}
      />
    </div>
  )
}
