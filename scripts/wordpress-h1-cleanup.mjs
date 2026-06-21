import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const outputDirectory = path.join(projectDirectory, '.h1-cleanup')
const applyChanges = process.argv.includes('--apply')

await loadEnvironment(path.join(projectDirectory, '.env.local'))

const apiUrl = (
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  ''
).replace(/\/+$/, '')
const username = process.env.WP_ADMIN_USER
const password = process.env.WP_ADMIN_PASS

if (!apiUrl || !username || !password) {
  throw new Error(
    'WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL, WP_ADMIN_USER, and WP_ADMIN_PASS are required.'
  )
}

if (
  applyChanges &&
  process.env.CONFIRM_WORDPRESS_H1_CLEANUP !== 'YES'
) {
  throw new Error(
    'Apply mode requires CONFIRM_WORDPRESS_H1_CLEANUP=YES.'
  )
}

const authHeader =
  'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

const records = [
  ...(await fetchCollection('posts')),
  ...(await fetchCollection('pages')),
]
const affected = records
  .map(analyzeRecord)
  .filter((record) => record.h1Count > 0)

await mkdir(outputDirectory, { recursive: true })

const backupPath = path.join(outputDirectory, `backup-${timestamp}.json`)
const reportPath = path.join(outputDirectory, `report-${timestamp}.json`)

await writeJson(backupPath, {
  createdAt: new Date().toISOString(),
  apiUrl,
  mode: applyChanges ? 'apply' : 'dry-run',
  records: affected.map((record) => ({
    type: record.type,
    id: record.id,
    slug: record.slug,
    link: record.link,
    status: record.status,
    title: record.title,
    originalContent: record.originalContent,
    originalSha256: record.originalSha256,
  })),
})

const results = []
for (const record of affected) {
  if (!applyChanges) {
    results.push(toReportRecord(record, 'not-updated'))
    continue
  }

  await updateRecord(record)
  const verified = await fetchRecord(record.type, record.id)
  const verifiedAnalysis = analyzeRecord(verified)

  if (verifiedAnalysis.h1Count !== 0) {
    throw new Error(
      `Verification failed for ${record.type} ${record.id}: H1 remains.`
    )
  }

  results.push(toReportRecord(record, 'updated-and-verified'))
}

await writeJson(reportPath, {
  createdAt: new Date().toISOString(),
  mode: applyChanges ? 'apply' : 'dry-run',
  scanned: records.length,
  affected: affected.length,
  h1Blocks: affected.reduce((sum, record) => sum + record.h1Count, 0),
  results,
})

process.stdout.write(
  JSON.stringify(
    {
      mode: applyChanges ? 'apply' : 'dry-run',
      scanned: records.length,
      affected: affected.length,
      h1Blocks: affected.reduce((sum, record) => sum + record.h1Count, 0),
      backupPath,
      reportPath,
    },
    null,
    2
  ) + '\n'
)

async function loadEnvironment(filePath) {
  let contents
  try {
    contents = await readFile(filePath, 'utf8')
  } catch {
    return
  }

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]] !== undefined) continue

    let value = match[2]
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[match[1]] = value
  }
}

async function fetchCollection(type) {
  const records = []
  let page = 1

  while (true) {
    const params = new URLSearchParams({
      context: 'edit',
      per_page: '100',
      page: String(page),
      status: 'any',
      _fields: 'id,slug,link,status,title,content,type',
    })
    const response = await wordpressRequest(
      `${apiUrl}/${type}?${params}`,
      {},
      `Fetch ${type} page ${page}`
    )
    const batch = await response.json()
    records.push(...batch)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || '1'
    )
    if (page >= totalPages) break
    page += 1
  }

  return records
}

async function fetchRecord(type, id) {
  const params = new URLSearchParams({
    context: 'edit',
    _fields: 'id,slug,link,status,title,content,type',
  })
  const response = await wordpressRequest(
    `${apiUrl}/${type}/${id}?${params}`,
    {},
    `Verify ${type} ${id}`
  )
  return response.json()
}

async function updateRecord(record) {
  await wordpressRequest(
    `${apiUrl}/${record.type}/${record.id}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: record.cleanedContent }),
    },
    `Update ${record.type} ${record.id}`
  )
}

async function wordpressRequest(url, options, context) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `${context} failed with status ${response.status}: ${body.slice(0, 300)}`
    )
  }

  return response
}

function analyzeRecord(record) {
  const originalContent =
    record.content?.raw ?? record.content?.rendered ?? ''
  const { content: cleanedContent, removed } = removeH1Blocks(originalContent)
  const title = stripHtml(record.title?.raw || record.title?.rendered || '')

  return {
    type: inferType(record),
    id: record.id,
    slug: record.slug,
    link: record.link,
    status: record.status,
    title,
    originalContent,
    cleanedContent,
    h1Count: removed.length,
    removed,
    originalSha256: sha256(originalContent),
    cleanedSha256: sha256(cleanedContent),
  }
}

function removeH1Blocks(content) {
  const removed = []
  let cleaned = content.replace(
    /<!--\s*wp:heading\b[^>]*"level"\s*:\s*1[^>]*-->[\s\S]*?<h1\b[^>]*>[\s\S]*?<\/h1\s*>[\s\S]*?<!--\s*\/wp:heading\s*-->/gi,
    (block) => {
      removed.push(summarizeH1(block))
      return ''
    }
  )

  cleaned = cleaned.replace(
    /<h1\b[^>]*>[\s\S]*?<\/h1\s*>/gi,
    (block) => {
      removed.push(summarizeH1(block))
      return ''
    }
  )

  return { content: cleaned, removed }
}

function summarizeH1(block) {
  return stripHtml(block).replace(/\s+/g, ' ').trim().slice(0, 240)
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function inferType(record) {
  return record.type === 'page' ? 'pages' : 'posts'
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function toReportRecord(record, result) {
  return {
    type: record.type,
    id: record.id,
    slug: record.slug,
    link: record.link,
    status: record.status,
    title: record.title,
    h1Count: record.h1Count,
    removedHeadings: record.removed,
    originalSha256: record.originalSha256,
    cleanedSha256: record.cleanedSha256,
    result,
  }
}

async function writeJson(filePath, value) {
  await writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8')
}
