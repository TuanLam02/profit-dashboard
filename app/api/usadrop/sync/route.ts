import { syncUsadropOrders } from '@/lib/usadrop'

export async function POST() {
  try {
    const result = await syncUsadropOrders()
    return Response.json({ ok: true, ...result })
  } catch (e) {
    console.error('[USADROP sync error]', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
