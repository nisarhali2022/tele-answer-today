'use client'

import { useEffect, useRef } from 'react'

function isDuplicateAdPushError(error) {
  return /already have ads/i.test(String(error?.message || error))
}

// Reports 'loading' → 'filled' | 'empty'. An ad counts as empty only when
// Google itself marks it data-ad-status="unfilled" (the quiz site's rule).
// There is deliberately no timeout: on slow mobile connections the AdSense
// script and auction can take well over 10 seconds, and removing the unit
// early throws away ads that were still on their way.
export default function AdSenseUnit({
  slot,
  publisherId,
  format = 'auto',
  className = '',
  onStatusChange,
  style,
  fullWidthResponsive = true,
}) {
  const adRef = useRef(null)

  useEffect(() => {
    const element = adRef.current
    if (!element || element.dataset.adsbygooglePushed === 'true') return
    if (element.dataset.adStatus) return

    onStatusChange?.('loading')

    const updateStatus = () => {
      if (element.dataset.adStatus === 'unfilled') {
        onStatusChange?.('empty')
        return true
      }

      if (
        element.dataset.adStatus === 'filled' ||
        element.querySelector('iframe')
      ) {
        onStatusChange?.('filled')
        return element.dataset.adStatus === 'filled'
      }

      return false
    }

    const observer = new MutationObserver(() => {
      if (updateStatus()) observer.disconnect()
    })
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
      subtree: true,
    })

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      element.dataset.adsbygooglePushed = 'true'
    } catch (error) {
      if (!isDuplicateAdPushError(error)) {
        console.warn('AdSense push failed', error)
      }
    }

    return () => observer.disconnect()
  }, [slot, format, onStatusChange])

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        // Fixed-size image ads pass format={null}: the <ins> width and height
        // then decide the ad size, which favours image creatives.
        data-ad-format={format || undefined}
        data-full-width-responsive={fullWidthResponsive ? 'true' : undefined}
      />
    </div>
  )
}
