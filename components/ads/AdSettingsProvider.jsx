'use client'

import { createContext, useContext } from 'react'

const AdSettingsContext = createContext(null)

export function AdSettingsProvider({ settings, children }) {
  return (
    <AdSettingsContext.Provider value={settings || null}>
      {children}
    </AdSettingsContext.Provider>
  )
}

export function useAdSettings() {
  return useContext(AdSettingsContext)
}
