import { NextRequest } from 'next/server'
import { getProducts, upsertProduct, deleteProduct } from '@/lib/products'

export async function GET() {
  return Response.json(await getProducts())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.sku || body.cog_price == null) {
    return Response.json({ error: 'sku and cog_price required' }, { status: 400 })
  }
  const product = await upsertProduct({
    sku: body.sku,
    name: body.name || body.sku,
    cog_price: parseFloat(body.cog_price),
  })
  return Response.json(product)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await deleteProduct(id)
  return Response.json({ ok: true })
}
