'use client'

import { useEffect, useRef } from 'react'

export default function AdSenseUnit({
  slot,
  publisherId,
  format = 'auto',
  className = '',
  onStatusChange,
  emptyTimeout = 8000,
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
        return true
      }

      return false
    }

    const observer = new MutationObserver(updateStatus)
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
      subtree: true,
    })

    const timeout = window.setTimeout(() => {
      if (!updateStatus()) onStatusChange?.('empty')
      observer.disconnect()
    }, emptyTimeout)

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      element.dataset.adsbygooglePushed = 'true'
    } catch (error) {
      if (!String(error?.message || '').includes('already have ads')) {
        console.error('AdSense push failed', error)
      }
      onStatusChange?.('empty')
      observer.disconnect()
      window.clearTimeout(timeout)
    }

    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
    }
  }, [slot, format, onStatusChange, emptyTimeout])

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
