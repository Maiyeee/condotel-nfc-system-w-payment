import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectLegacyCandidates, buildReviewSummary } from './normalizeLegacyData.js'
import { loadLegacyExport } from './readLegacyExport.js'
import { writeJsonFile } from './helpers.js'

const __filename = fileURLToPath(import.meta.url)

export function reviewLegacyExport(filePath) {
  const legacyExport = loadLegacyExport(filePath)
  const candidates = collectLegacyCandidates(legacyExport)
  const summary = buildReviewSummary(candidates)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = path.resolve('data-migration/reports', `review-${timestamp}.json`)

  const report = {
    phase: '7G',
    mode: 'review-only',
    source: {
      name: legacyExport.sourceName,
      sha256: legacyExport.sourceSha256,
      origin: legacyExport.origin,
      exportedAt: legacyExport.exportedAt,
      format: legacyExport.format,
    },
    summary,
    warnings: candidates.warnings,
    deferredKeys: candidates.deferredKeys,
    ignoredKeys: candidates.ignoredKeys,
    candidates: {
      guests: candidates.guests,
      rooms: candidates.rooms,
      reservations: candidates.reservations,
    },
  }

  writeJsonFile(reportPath, report)
  return { report, reportPath }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: npm run data:migrate:review -- <legacy-export.json>')
    process.exit(1)
  }

  const { report, reportPath } = reviewLegacyExport(input)
  console.log('Phase 7G review complete.')
  console.log(`Source SHA-256: ${report.source.sha256}`)
  console.log(`Guests: ${report.summary.guests.total}, Rooms: ${report.summary.rooms.total}, Reservations: ${report.summary.reservations.total}`)
  console.log(`Invalid candidates: ${report.summary.invalidRecords}`)
  console.log(`Deferred storage keys: ${report.summary.deferredKeys}`)
  console.log(`Review report: ${reportPath}`)
}
