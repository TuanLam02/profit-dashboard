import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const token = await redis.get<string>('usadrop_jwt')
  if (!token) return Response.json({ error: 'No token in Redis' })

  const headers = { Authorization: `Bearer ${token}` }

  const filterVariants = [
    { TabType: 1, UserId: '', SalesRecord: '', CustomerPayment: '' },
    { TabType: 1, UserId: '4', SalesRecord: '', CustomerPayment: '' },
    { TabType: 1, StoreId: 4, UserId: '', SalesRecord: '', CustomerPayment: '' },
    { TabType: 1, ShopId: 4, UserId: '', SalesRecord: '', CustomerPayment: '' },
    { TabType: 1, ShopName: 'fb90ru-ks', UserId: '', SalesRecord: '', CustomerPayment: '' },
  ]

  const results = []
  for (const filter of filterVariants) {
    const res = await fetch('https://app.usadrop.com/api/Order/GetOrderList2', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ CurrentPageIndex: 1, PageSize: 3, Keywords: '', Filter: filter }),
    })
    const data = await res.json()
    results.push({
      filter,
      status: res.status,
      totalCount: data?.TotalCount ?? data?.Total,
      firstOrder: data?.Items?.[0]
        ? { OrderNo: data.Items[0].OrderNo, SalesRecord: data.Items[0].SalesRecord }
        : null,
    })
  }
  return Response.json({ results })
}
