import { Redis } from '@upstash/redis'

const BASE = 'https://app.usadrop.com/api'
const AUTH = 'https://webapi.usadrop.com/api/Login'
const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

async function login(): Promise<string> {
  const res = await fetch(`${AUTH}/GetJwtToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Account: process.env.USADROP_EMAIL,
      Password: process.env.USADROP_PASSWORD,
    }),
  })
  const text = await res.text()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any
  try { data = JSON.parse(text) } catch { throw new Error(`USADROP login non-JSON (${res.status}): ${text.slice(0, 200)}`) }

  // Response: { code, success, data: { token, refreshToken, ... } }
  const token: string = data?.data?.token ?? data?.data?.Token ?? data?.Token ?? data?.Data?.Token ?? data?.token ?? ''
  const refresh: string = data?.data?.refreshToken ?? data?.data?.RefreshToken ?? data?.RefreshToken ?? data?.refresh_token ?? ''
  if (!token) throw new Error(`USADROP login no token. Response: ${text.slice(0, 300)}`)

  await Promise.all([
    redis.set('usadrop_jwt', token, { ex: 3500 }),
    refresh ? redis.set('usadrop_refresh', refresh, { ex: 86400 * 7 }) : Promise.resolve(),
  ])
  return token
}

async function refreshToken(): Promise<string> {
  const refresh = await redis.get<string>('usadrop_refresh')
  if (!refresh) return login()

  const res = await fetch(`${AUTH}/RefreshToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RefreshToken: refresh }),
  })
  const text = await res.text()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any
  try { data = JSON.parse(text) } catch { return login() }

  const token: string = data?.Token ?? data?.access_token ?? ''
  if (!token) return login()

  await redis.set('usadrop_jwt', token, { ex: 3500 })
  return token
}

async function getToken(): Promise<string> {
  const cached = await redis.get<string>('usadrop_jwt')
  if (cached) return cached
  // Try refresh first, fall back to full login
  return refreshToken()
}

async function fetchPage(token: string, page: number, pageSize: number) {
  // UserId "4" = StoreId of fb90ru-ks — filters to only this store's orders
  const storeId = process.env.USADROP_STORE_ID ?? '4'
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
      Filter: { TabType: 1, UserId: storeId, SalesRecord: '', CustomerPayment: '' },
    }),
  })
  const data = await res.json()
  return (data?.Items ?? []) as Record<string, unknown>[]
}

export type UsadropEntry = { cost: number; name: string }

export async function syncUsadropOrders(): Promise<{ synced: number; total: number }> {
  let token = await getToken()

  const existing = (await redis.get<Record<string, UsadropEntry>>('usadrop_costs')) ?? {}
  const PAGE_SIZE = 200
  let page = 1
  let synced = 0

  while (true) {
    let items: Record<string, unknown>[]
    try {
      items = await fetchPage(token, page, PAGE_SIZE)
    } catch {
      token = await login()
      items = await fetchPage(token, page, PAGE_SIZE)
    }

    if (!items.length) break

    for (const order of items) {
      const orderNo = String(order.OrderNo ?? '').trim()
      const name = String(order.SalesRecord ?? '').trim()
      const cost = parseFloat(String(order.QuotedPrice ?? '0'))
      if (orderNo && cost > 0) {
        existing[orderNo] = { cost, name }
        synced++
      }
    }

    if (items.length < PAGE_SIZE) break
    page++
  }

  await redis.set('usadrop_costs', existing)
  return { synced, total: Object.keys(existing).length }
}
