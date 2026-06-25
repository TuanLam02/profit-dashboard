import { Redis } from '@upstash/redis'

const BASE = 'https://app.usadrop.com/api'
const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/Member/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      UserName: process.env.USADROP_EMAIL,
      Password: process.env.USADROP_PASSWORD,
    }),
  })
  const text = await res.text()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any
  try { data = JSON.parse(text) } catch { throw new Error(`USADROP login non-JSON: ${text.slice(0, 200)}`) }

  // Response format: { Success, Token, RefreshToken, ExpiresIn, ... }
  const token: string = data?.Token ?? data?.Data?.Token ?? data?.token ?? ''
  if (!token) throw new Error(`USADROP login no token. Response: ${text.slice(0, 300)}`)
  await redis.set('usadrop_jwt', token, { ex: 3500 })
  return token
}

async function getToken(): Promise<string> {
  const cached = await redis.get<string>('usadrop_jwt')
  if (cached) return cached
  return login()
}

async function fetchPage(token: string, page: number, pageSize: number) {
  const res = await fetch(`${BASE}/Order/GetOrderList2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      CurrentPageIndex: page,
      PageSize: pageSize,
      Keywords: '',
      Filter: { TabType: 1, UserId: '', SalesRecord: '', CustomerPayment: '' },
    }),
  })
  const data = await res.json()
  return (data?.Items ?? []) as Record<string, unknown>[]
}

export async function syncUsadropOrders(): Promise<{ synced: number; total: number }> {
  let token = await getToken()

  const existing = (await redis.get<Record<string, number>>('usadrop_costs')) ?? {}
  const PAGE_SIZE = 200
  let page = 1
  let synced = 0

  while (true) {
    let items: Record<string, unknown>[]
    try {
      items = await fetchPage(token, page, PAGE_SIZE)
    } catch {
      // Token expired — re-login once
      token = await login()
      items = await fetchPage(token, page, PAGE_SIZE)
    }

    if (!items.length) break

    for (const order of items) {
      const salesRecord = String(order.SalesRecord ?? '').trim()
      const cost = parseFloat(String(order.QuotedPrice ?? '0'))
      if (salesRecord.startsWith('#') && cost > 0) {
        existing[salesRecord] = cost
        synced++
      }
    }

    if (items.length < PAGE_SIZE) break
    page++
  }

  await redis.set('usadrop_costs', existing)
  return { synced, total: Object.keys(existing).length }
}
