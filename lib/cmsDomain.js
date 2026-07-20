const LOCAL_OR_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function normalizeCmsDomain(value) {
  const host = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]

  if (!host) return ''
  if (host.startsWith('[')) {
    const closingBracket = host.indexOf(']')
    if (closingBracket > 0) return host.slice(1, closingBracket)
  }
  if (host === '::1') return host

  return host.replace(/:\d+$/, '').replace(/^www\./, '')
}

export function resolveCmsDomain(hostValue, configuredValue) {
  const host = normalizeCmsDomain(hostValue)
  const configuredDomain = normalizeCmsDomain(configuredValue)

  if (
    configuredDomain &&
    (!host || LOCAL_OR_PREVIEW_HOSTS.has(host) || host.endsWith('.vercel.app'))
  ) {
    return configuredDomain
  }

  return host || configuredDomain
}
