import { syncUsadropOrders } from '@/lib/usadrop'
import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    // If reset=true, clear old cost data (e.g. after switching key format)
    if (body?.reset) await redis.del('usadrop_costs')
    const result = await syncUsadropOrders()
    return Response.json({ ok: true, ...result })
  } catch (e) {
    console.error('[USADROP sync error]', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
