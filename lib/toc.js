import { stripHtml } from './utils';

function slugifyHeading(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getUniqueId(baseId, usedIds) {
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

export function generateTocAndInjectIds(html) {
  if (!html) return { modifiedHtml: '', toc: [] };

  const toc = [];
  const usedIds = new Set();

  const regex = /<(h[1234])([^>]*)>(.*?)<\/\1>/gi;

  const modifiedHtml = html.replace(regex, (match, tag, attrs, content) => {
    const cleanText = stripHtml(content).trim();
    if (!cleanText) return match;

    const idMatch = attrs.match(/\sid=["']([^"']*)["']/i);
    const requestedId = slugifyHeading(idMatch?.[1] || cleanText);
    const fallbackId = `section-${toc.length + 1}`;
    const id = getUniqueId(requestedId || fallbackId, usedIds);
    const attrsWithoutId = attrs.replace(/\s+id=["'][^"']*["']/i, '');

    toc.push({
      id,
      text: cleanText,
      level: parseInt(tag.replace('h', ''), 10)
    });

    return `<${tag} id="${id}"${attrsWithoutId}>${content}</${tag}>`;
  });

  return { modifiedHtml, toc };
}
