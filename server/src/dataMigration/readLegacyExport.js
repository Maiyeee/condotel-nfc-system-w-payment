import path from 'node:path'
import { ensureArray, readJsonFile, sha256 } from './helpers.js'

function parseEntry(entry) {
  if (entry && Object.prototype.hasOwnProperty.call(entry, 'parsed')) return entry.parsed
  if (entry && Object.prototype.hasOwnProperty.call(entry, 'value')) return entry.value
  if (entry && typeof entry.raw === 'string') {
    try { return JSON.parse(entry.raw) } catch { return entry.raw }
  }
  return null
}

export function loadLegacyExport(filePath) {
  const { absolute, text } = readJsonFile(filePath)
  const document = JSON.parse(text)

  let entries = []
  if (Array.isArray(document.entries)) {
    entries = document.entries.map((entry) => ({
      key: String(entry.key || ''),
      value: parseEntry(entry),
    }))
  } else if (document.localStorage && typeof document.localStorage === 'object') {
    entries = Object.entries(document.localStorage).map(([key, value]) => ({ key, value }))
  } else if (document && typeof document === 'object') {
    entries = Object.entries(document)
      .filter(([key]) => !['format', 'exportedAt', 'origin'].includes(key))
      .map(([key, value]) => ({ key, value }))
  }

  return {
    path: absolute,
    sourceName: path.basename(absolute),
    sourceSha256: sha256(text),
    origin: String(document.origin || ''),
    exportedAt: String(document.exportedAt || ''),
    format: String(document.format || 'unknown'),
    entries,
    rawDocument: document,
  }
}

export function arraysFromEntry(entry) {
  return ensureArray(entry.value)
}
