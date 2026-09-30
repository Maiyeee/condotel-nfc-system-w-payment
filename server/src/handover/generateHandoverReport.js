import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyPhase7 } from './verifyPhase7.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '../..')
const reportsDir = path.join(serverRoot, 'handover', 'reports')

function safeStamp(date = new Date()) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

export function generateHandoverReport() {
  const result = verifyPhase7()
  fs.mkdirSync(reportsDir, { recursive: true })

  const lines = [
    '# Condotel Phase 7 Handover Report',
    '',
    `Generated: ${result.checkedAt}`,
    `Status: ${result.ok ? 'PASS' : 'FAIL'}`,
    `Database: ${result.databasePath}`,
    '',
    '## Record counts',
    '',
    `- Guests: ${result.counts.guests}`,
    `- Rooms: ${result.counts.rooms}`,
    `- Reservations: ${result.counts.reservations}`,
    `- Reservation charges: ${result.counts.charges}`,
    `- Data migration runs: ${result.counts.migrationRuns}`,
    `- Data migration items: ${result.counts.migrationItems}`,
    '',
    '## Acceptance checks',
    ''
  ]

  for (const item of result.checks) {
    lines.push(`- [${item.ok ? 'x' : ' '}] ${item.name}${item.details ? `: ${item.details}` : ''}`)
  }

  lines.push(
    '',
    '## Phase 7 scope handed over',
    '',
    '- Express backend foundation',
    '- SQLite database foundation and migrations 001 through 006',
    '- Guests backend',
    '- Rooms backend',
    '- Reservations and reservation charges backend',
    '- React frontend consistency for Guests, Rooms, Reservations, and Charges',
    '- Legacy localStorage data migration tooling',
    '- Phase 7 acceptance tests and operational verification',
    '',
    '## Not included in Phase 7',
    '',
    '- Production authentication and permissions',
    '- Field encryption and key rotation',
    '- PayMongo integration',
    '- ESP32/NFC device integration',
    '',
    'If this report contains any failed check, resolve it before treating Phase 7 as handed over.'
  )

  const filename = `phase7-handover-${safeStamp()}.md`
  const outputPath = path.join(reportsDir, filename)
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8')

  return { outputPath, result }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const { outputPath, result } = generateHandoverReport()
  console.log(`Phase 7 handover report: ${result.ok ? 'PASS' : 'FAIL'}`)
  console.log(`Report: ${outputPath}`)
  if (!result.ok) process.exitCode = 1
}
