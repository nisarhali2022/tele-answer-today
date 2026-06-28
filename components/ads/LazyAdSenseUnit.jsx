'use client'

import { useEffect, useRef, useState } from 'react'
import AdSenseUnit from './AdSenseUnit'

export default function LazyAdSenseUnit({
  slot,
  format = 'auto',
  className = '',
  eager = false,
  rootMargin = '900px 0px',
  loadingClassName = 'min-h-16 md:min-h-[120px]',
  emptyTimeout = 8000,
  collapseWhenEmpty = true,
}) {
  const ref = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(eager)
  const [adStatus, setAdStatus] = useState(eager ? 'loading' : 'idle')

  useEffect(() => {
    if (shouldLoad || eager) return

    const element = ref.current
    if (!element) return

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          setAdStatus('loading')
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [eager, rootMargin, shouldLoad])

  if (adStatus === 'empty' && collapseWhenEmpty) return null

  const loadingClass =
    shouldLoad && adStatus === 'loading' ? loadingClassName : ''

  return (
    <div ref={ref} className={`${className} ${loadingClass}`.trim()}>
      {shouldLoad ? (
        <AdSenseUnit
          slot={slot}
          format={format}
          emptyTimeout={emptyTimeout}
          onStatusChange={setAdStatus}
        />
      ) : null}
    </div>
  )
}
