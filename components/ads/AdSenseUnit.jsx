'use client'

import { useEffect } from 'react'
import { useRef } from 'react'
import { SITE_CONFIG } from '@/lib/constants'

export default function AdSenseUnit({ slot, format = 'auto', className = '' }) {
  const adRef = useRef(null)

  useEffect(() => {
    const element = adRef.current
    if (!element || element.dataset.adsbygooglePushed === 'true') return
    if (element.dataset.adStatus) return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      element.dataset.adsbygooglePushed = 'true'
    } catch (error) {
      if (!String(error?.message || '').includes('already have ads')) {
        console.error('AdSense push failed', error)
      }
    }
  }, [slot, format])

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={SITE_CONFIG.googleAdsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
