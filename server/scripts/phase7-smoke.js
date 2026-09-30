const baseUrl = (process.env.API_URL || 'http://localhost:4000/api').replace(/\/$/, '')

const checks = [
  ['Health', '/health'],
  ['Guests', '/guests?limit=1'],
  ['Rooms', '/rooms?limit=1'],
  ['Room summary', '/rooms/summary'],
  ['Reservations', '/reservations?limit=1'],
  ['Reservation summary', '/reservations/summary']
]

let failed = false

for (const [name, route] of checks) {
  try {
    const response = await fetch(`${baseUrl}${route}`)
    const body = await response.text()

    if (!response.ok) {
      failed = true
      console.error(`FAIL  ${name} - HTTP ${response.status} - ${body.slice(0, 200)}`)
      continue
    }

    let parsed
    try {
      parsed = JSON.parse(body)
    } catch {
      parsed = null
    }

    if (!parsed || !('data' in parsed)) {
      failed = true
      console.error(`FAIL  ${name} - response does not contain a data field`)
      continue
    }

    console.log(`PASS  ${name} - ${baseUrl}${route}`)
  } catch (error) {
    failed = true
    console.error(`FAIL  ${name} - ${error.message}`)
  }
}

if (failed) {
  console.error('\nPhase 7 API smoke test: FAIL')
  console.error('Start the backend with npm run dev, then run this command again.')
  process.exitCode = 1
} else {
  console.log('\nPhase 7 API smoke test: PASS')
}
