import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function parseNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  return parseFloat(String(val).replace(',', '.')) || 0
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  // Load existing costs from Redis
  const existing = (await redis.get<Record<string, number>>('usadrop_costs')) ?? {}

  let imported = 0
  for (const row of rows) {
    const rawOrderNum = String(row['Order Number'] ?? '').trim()
    // "Shop #1215" → "#1215"
    const match = rawOrderNum.match(/#\d+/)
    if (!match) continue

    const orderNum = match[0]
    const cost = parseNum(row['Order QuotedPrice'])
    if (cost <= 0) continue

    existing[orderNum] = cost
    imported++
  }

  await redis.set('usadrop_costs', existing)

  return Response.json({ ok: true, imported, total: Object.keys(existing).length })
}
