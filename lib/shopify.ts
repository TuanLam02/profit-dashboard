const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const API = `https://${DOMAIN}/admin/api/2024-01`

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
    created_at_min: `${dateStart}T00:00:00+07:00`,
    created_at_max: `${dateEnd}T23:59:59+07:00`,
  })
  const data = await shopifyFetch(`/orders.json?${params}`)
  return data.orders ?? []
}
