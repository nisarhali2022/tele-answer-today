'use client'

import { useEffect, useRef, useState } from 'react'
import AdSenseUnit from './AdSenseUnit'

export default function LazyAdSenseUnit({
  slot,
  format = 'auto',
  className = '',
  eager = false,
  rootMargin = '900px 0px',
}) {
  const ref = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(eager)

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
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [eager, rootMargin, shouldLoad])

  return (
    <div ref={ref} className={className}>
      {shouldLoad ? <AdSenseUnit slot={slot} format={format} /> : null}
    </div>
  )
}
