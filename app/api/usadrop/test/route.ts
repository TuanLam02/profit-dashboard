import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const token = await redis.get<string>('usadrop_jwt')
  if (!token) return Response.json({ error: 'No token in Redis' })

  const res = await fetch('https://app.usadrop.com/api/Order/GetOrderList2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      CurrentPageIndex: 1,
      PageSize: 2,
      Keywords: '',
      Filter: { TabType: 1, UserId: '', SalesRecord: '', CustomerPayment: '' },
    }),
  })

  const data = await res.json()
  // Return first 2 orders with ALL fields so we can see store identifier
  return Response.json({ status: res.status, items: data?.Items?.slice(0, 2) ?? [], keys: Object.keys(data?.Items?.[0] ?? {}) })
}
