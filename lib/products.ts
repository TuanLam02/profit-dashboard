import fs from 'fs'
import path from 'path'

export type Product = {
  id: string
  sku: string
  name: string
  cog_price: number
}

// ─── Local file (dev) ────────────────────────────────────────────────────────

const FILE = path.join(process.cwd(), 'data', 'products.json')

function readFile(): Product[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeFile(products: Product[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(products, null, 2))
}

// ─── Upstash Redis (production) ──────────────────────────────────────────────

async function getRedis() {
  const { Redis } = await import('@upstash/redis')
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

async function kvGet(): Promise<Product[]> {
  const redis = await getRedis()
  const data = await redis.get<Product[]>('products')
  return data ?? []
}

async function kvSet(products: Product[]) {
  const redis = await getRedis()
  await redis.set('products', products)
}

// ─── Unified API ─────────────────────────────────────────────────────────────

const useKV = !!process.env.KV_REST_API_URL

export async function getProducts(): Promise<Product[]> {
  return useKV ? kvGet() : readFile()
}

export async function upsertProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const products = await getProducts()
  const idx = products.findIndex((p) => p.sku === data.sku)
  if (idx >= 0) {
    products[idx] = { ...products[idx], ...data }
    useKV ? await kvSet(products) : writeFile(products)
    return products[idx]
  }
  const product: Product = { id: crypto.randomUUID(), ...data }
  products.push(product)
  useKV ? await kvSet(products) : writeFile(products)
  return product
}

export async function deleteProduct(id: string) {
  const products = (await getProducts()).filter((p) => p.id !== id)
  useKV ? await kvSet(products) : writeFile(products)
}

export async function getCogMap(): Promise<Map<string, number>> {
  const products = await getProducts()
  return new Map(products.map((p) => [p.sku, p.cog_price]))
}
