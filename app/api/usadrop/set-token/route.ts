import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token || typeof token !== 'string') return Response.json({ ok: false, error: 'Missing token' })
  await redis.set('usadrop_jwt', token, { ex: 3500 })
  return Response.json({ ok: true, preview: token.slice(0, 30) + '...' })
}
