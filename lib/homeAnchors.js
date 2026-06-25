export function homeAnchorId(text = '') {
  return String(text)
    .trim()
    .replace(/&/g, ' and ')
    .replace(/['"`]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
