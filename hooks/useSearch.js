'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useSearch({ onSearch, clearOnSearch = false } = {}) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`)
        onSearch?.(trimmed)
        if (clearOnSearch) setQuery('')
      }
    },
    [clearOnSearch, onSearch, query, router]
  )

  return { query, setQuery, handleSearch }
}
