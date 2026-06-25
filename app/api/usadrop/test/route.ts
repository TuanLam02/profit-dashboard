import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const token = await redis.get<string>('usadrop_jwt')
  if (!token) return Response.json({ error: 'No token in Redis' })

  const headers = { Authorization: `Bearer ${token}` }

  // Compare total count: no filter vs UserId=4 filter
  const noFilter = await fetch('https://app.usadrop.com/api/Order/GetOrderList2', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ CurrentPageIndex: 1, PageSize: 1, Keywords: '', Filter: { TabType: 1, UserId: '', SalesRecord: '', CustomerPayment: '' } }),
  }).then(r => r.json())

  const withFilter = await fetch('https://app.usadrop.com/api/Order/GetOrderList2', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ CurrentPageIndex: 1, PageSize: 1, Keywords: '', Filter: { TabType: 1, UserId: '4', SalesRecord: '', CustomerPayment: '' } }),
  }).then(r => r.json())

  return Response.json({
    noFilter: { total: noFilter?.TotalCount, first: noFilter?.Items?.[0]?.SalesRecord },
    withFilter: { total: withFilter?.TotalCount, first: withFilter?.Items?.[0]?.SalesRecord },
  })
}
