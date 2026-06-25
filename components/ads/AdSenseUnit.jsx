'use client'

import { useEffect, useRef } from 'react'
import { SITE_CONFIG } from '@/lib/constants'

export default function AdSenseUnit({
  slot,
  format = 'auto',
  className = '',
  onStatusChange,
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
    }, 4500)

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
  }, [slot, format, onStatusChange])

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
