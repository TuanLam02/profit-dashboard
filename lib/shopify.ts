const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN
const API = `https://${DOMAIN}/admin/api/2024-01`

async function shopifyFetch(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'X-Shopify-Access-Token': TOKEN! },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)
  return res.json()
}

export type ShopifyOrder = {
  id: number
  name: string
  total_price: string
  subtotal_price: string
  created_at: string
  financial_status: string
  line_items: Array<{
    sku: string
    quantity: number
    price: string
    title: string
  }>
}

export async function getOrders(dateStart: string, dateEnd: string): Promise<ShopifyOrder[]> {
  const params = new URLSearchParams({
    status: 'any',
    financial_status: 'paid',
    limit: '250',
    created_at_min: `${dateStart}T00:00:00`,
    created_at_max: `${dateEnd}T23:59:59`,
  })
  const data = await shopifyFetch(`/orders.json?${params}`)
  return data.orders ?? []
}

export async function getOrdersToday(): Promise<ShopifyOrder[]> {
  const today = new Date().toISOString().split('T')[0]
  return getOrders(today, today)
}
