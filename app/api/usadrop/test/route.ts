import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const token = await redis.get<string>('usadrop_jwt')
  if (!token) return Response.json({ error: 'No token in Redis' })

  const headers = { Authorization: `Bearer ${token}` }

  // Try GetOrderList2 with UserId filter for fb90ru-ks
  const res = await fetch('https://app.usadrop.com/api/Order/GetOrderList2', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      CurrentPageIndex: 1,
      PageSize: 5,
      Keywords: '',
      Filter: {
        TabType: 1,
        UserId: 'Shopify835651c6fb574905b9fd9d74d7ae2214',
        SalesRecord: '',
        CustomerPayment: '',
      },
    }),
  })
  const data = await res.json()
  return Response.json({
    status: res.status,
    totalCount: data?.TotalCount,
    items: (data?.Items ?? []).slice(0, 3).map((o: Record<string, unknown>) => ({
      OrderNo: o.OrderNo,
      SalesRecord: o.SalesRecord,
      QuotedPrice: o.QuotedPrice,
    })),
  })
}
