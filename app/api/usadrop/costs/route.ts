import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const raw = await redis.get<Record<string, unknown>>('usadrop_costs')
  if (!raw) return Response.json([])

  const entries = Object.entries(raw)
    .map(([orderNo, val]) => {
      if (typeof val === 'number') return { orderNo, name: '', cost: val }
      const v = val as { cost: number; name: string }
      return { orderNo, name: v.name ?? '', cost: v.cost ?? 0 }
    })
    .filter(e => e.cost > 0)
    .sort((a, b) => (b.name > a.name ? 1 : -1))

  return Response.json(entries)
}
