import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const token = await redis.get<string>('usadrop_jwt')
  if (!token) return Response.json({ error: 'No token in Redis' })

  const headers = { Authorization: `Bearer ${token}` }

  // Step 1: Get store list
  const storeRes = await fetch('https://app.usadrop.com/api/Store/GetList', { headers })
  const storeData = await storeRes.json()

  return Response.json({ storeStatus: storeRes.status, stores: storeData })
}
