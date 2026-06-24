import { NextRequest } from 'next/server'
import { upsertProduct } from '@/lib/products'

export async function POST(req: NextRequest) {
  const { csv } = await req.json()
  if (!csv) return Response.json({ error: 'No CSV data' }, { status: 400 })

  const lines = (csv as string).trim().split('\n').slice(1)
  let imported = 0

  for (const line of lines) {
    const [sku, name, cog_price] = line.split(',').map((s: string) => s.trim())
    if (!sku || !cog_price) continue
    await upsertProduct({ sku, name: name || sku, cog_price: parseFloat(cog_price) })
    imported++
  }

  if (imported === 0) return Response.json({ error: 'No valid rows' }, { status: 400 })
  return Response.json({ ok: true, imported })
}
