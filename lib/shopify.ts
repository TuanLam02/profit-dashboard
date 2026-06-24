const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const API = `https://${DOMAIN}/admin/api/2024-01`

function getPacificOffset(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }))
  const pac = new Date(d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const diff = Math.round((pac.getTime() - utc.getTime()) / 60000)
  const sign = diff >= 0 ? '+' : '-'
  const abs = Math.abs(diff)
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

async function getToken(): Promise<string> {
  // Dùng env var nếu có, không thì đọc từ Redis
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
  const t = await redis.get<string>('shopify_token')
  if (!t) throw new Error('Shopify token not set. Visit /api/auth/shopify to connect.')
  return t
}

async function shopifyFetch(path: string) {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    headers: { 'X-Shopify-Access-Token': token },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)
  return res.json()
}

export type ShopifyOrder = {
  id: number
  name: string
  total_price: string
  created_at: string
  financial_status: string
  line_items: Array<{ sku: string; quantity: number; price: string; title: string }>
}

export async function getOrders(dateStart: string, dateEnd: string): Promise<ShopifyOrder[]> {
  const params = new URLSearchParams({
    status: 'any',
    financial_status: 'paid',
    limit: '250',
    created_at_min: `${dateStart}T00:00:00${getPacificOffset(dateStart)}`,
    created_at_max: `${dateEnd}T23:59:59${getPacificOffset(dateEnd)}`,
  })
  const data = await shopifyFetch(`/orders.json?${params}`)
  return data.orders ?? []
}
