import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '../..')

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_PATH: z.string().min(1).default('./data/condotel.sqlite'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173')
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const raw = parsed.data

export const env = {
  ...raw,
  DB_PATH: path.isAbsolute(raw.DB_PATH)
    ? raw.DB_PATH
    : path.resolve(serverRoot, raw.DB_PATH)
}
