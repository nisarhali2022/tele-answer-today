import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const outputDirectory = path.join(projectDirectory, '.h1-cleanup')
const titleValue = process.env.WORDPRESS_TITLE_VALUE || 'above'
const onlyIdArgument = process.argv.find((value) =>
  value.startsWith('--only-id=')
)
const onlyId = onlyIdArgument
  ? Number(onlyIdArgument.slice('--only-id='.length))
  : null
const reportArgument = process.argv.find((value) =>
  value.startsWith('--report=')
)

if (!reportArgument) {
  throw new Error('Pass the cleanup apply report with --report=<path>.')
}

await loadEnvironment(path.join(projectDirectory, '.env.local'))

if (process.env.CONFIRM_WORDPRESS_TITLE_RESTORE !== 'YES') {
  throw new Error(
    'Title restore requires CONFIRM_WORDPRESS_TITLE_RESTORE=YES.'
  )
}

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

const authHeader =
  'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
const reportPath = path.resolve(
  projectDirectory,
  reportArgument.slice('--report='.length)
)
const cleanupReport = JSON.parse(await readFile(reportPath, 'utf8'))
const scope = cleanupReport.results.filter(
  (record) => record.result === 'updated-and-verified'
)
const candidates = []

for (const record of scope) {
  if (record.type !== 'posts') continue
  if (onlyId && record.id !== onlyId) continue

  const current = await fetchRecord(record.type, record.id)
  const previousValue = current.meta?._kad_post_title ?? ''

  if (previousValue === titleValue) continue

  candidates.push({
    type: record.type,
    id: record.id,
    slug: record.slug,
    link: record.link,
    previousValue,
  })
}

await mkdir(outputDirectory, { recursive: true })
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupPath = path.join(
  outputDirectory,
  `title-meta-backup-${timestamp}.json`
)
await writeFile(
  backupPath,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      cleanupReport: reportPath,
      records: candidates,
    },
    null,
    2
  ) + '\n',
  'utf8'
)

const changes = []
for (const record of candidates) {
  await updateTitleSetting(record.type, record.id)
  const verified = await fetchRecord(record.type, record.id)
  const verifiedValue = verified.meta?._kad_post_title ?? ''

  if (verifiedValue !== titleValue) {
    throw new Error(
      `Title verification failed for ${record.type} ${record.id}.`
    )
  }

  changes.push({
    ...record,
    currentValue: verifiedValue,
  })
}

process.stdout.write(
  JSON.stringify(
    {
      scopedRecords: scope.length,
      titlesRestored: changes.length,
      backupPath,
    },
    null,
    2
  ) + '\n'
)

async function fetchRecord(type, id) {
  const response = await wordpressRequest(
    `${apiUrl}/${type}/${id}?context=edit&_fields=id,slug,link,meta`,
    {},
    `Fetch ${type} ${id}`
  )
  return response.json()
}

async function updateTitleSetting(type, id) {
  await wordpressRequest(
    `${apiUrl}/${type}/${id}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meta: { _kad_post_title: titleValue },
      }),
    },
    `Restore title for ${type} ${id}`
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
