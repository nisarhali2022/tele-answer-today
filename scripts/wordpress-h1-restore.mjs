import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const argumentsMap = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((value) => value.startsWith('--') && value.includes('='))
    .map((value) => {
      const separator = value.indexOf('=')
      return [value.slice(2, separator), value.slice(separator + 1)]
    })
)

for (const name of ['content-backup', 'first-meta-backup', 'all-meta-backup']) {
  if (!argumentsMap[name]) {
    throw new Error(`Missing --${name}=<path>.`)
  }
}

await loadEnvironment(path.join(projectDirectory, '.env.local'))

if (process.env.CONFIRM_WORDPRESS_H1_RESTORE !== 'YES') {
  throw new Error('Restore requires CONFIRM_WORDPRESS_H1_RESTORE=YES.')
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
const contentBackup = await readJson(argumentsMap['content-backup'])
const firstMetaBackup = await readJson(argumentsMap['first-meta-backup'])
const allMetaBackup = await readJson(argumentsMap['all-meta-backup'])
const originalHiddenIds = new Set(
  firstMetaBackup.records.map((record) => record.id)
)
const laterPreviousValues = new Map(
  allMetaBackup.records.map((record) => [record.id, record.previousValue])
)

let restored = 0
for (const record of contentBackup.records) {
  const originalTitleValue = originalHiddenIds.has(record.id)
    ? 'hide'
    : laterPreviousValues.get(record.id) ?? ''

  await wordpressRequest(
    `${apiUrl}/${record.type}/${record.id}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: record.originalContent,
        meta: { _kad_post_title: originalTitleValue },
      }),
    },
    `Restore ${record.type} ${record.id}`
  )

  const verified = await fetchRecord(record.type, record.id)
  const content = verified.content?.raw ?? ''
  const titleValue = verified.meta?._kad_post_title ?? ''

  if (content !== record.originalContent || titleValue !== originalTitleValue) {
    throw new Error(`Restore verification failed for ${record.type} ${record.id}.`)
  }

  restored += 1
}

process.stdout.write(
  JSON.stringify({ restored, verified: restored }, null, 2) + '\n'
)

async function readJson(filePath) {
  const absolutePath = path.resolve(projectDirectory, filePath)
  return JSON.parse(await readFile(absolutePath, 'utf8'))
}

async function fetchRecord(type, id) {
  const response = await wordpressRequest(
    `${apiUrl}/${type}/${id}?context=edit&_fields=id,content,meta`,
    {},
    `Verify ${type} ${id}`
  )
  return response.json()
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
