export function getAdSenseSettings(settings) {
  const adsense = settings?.adsense || {}
  const publisherId = String(adsense.publisherId || '').trim()
  const isValidPublisher = publisherId.startsWith('ca-pub-')
  const configuredAdsTxt = String(adsense.adsTxt || '').trim()
  const adsTxt = configuredAdsTxt || (
    isValidPublisher
      ? `google.com, ${publisherId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`
      : ''
  )

  return {
    enabled: adsense.enabled === true && isValidPublisher,
    publisherId,
    adsTxt,
    slots: adsense.slots && typeof adsense.slots === 'object' ? adsense.slots : {},
  }
}

export function getAdSenseSlot(settings, position) {
  const slots = getAdSenseSettings(settings).slots
  const aliases = {
    top: ['top', 'topLeaderboard'],
    mid: ['mid', 'belowHeader'],
    'in-article': ['inArticle', 'in-article'],
    sidebar: ['sidebar'],
    'after-content': ['afterContent', 'after-content'],
    bottom: ['bottom'],
  }

  for (const key of aliases[position] || [position]) {
    const slot = String(slots[key] || '').trim()
    if (slot) return slot
  }

  return ''
}
