import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
const MAX_ATTEMPTS = 10
const LOCKOUT_SECONDS = 15 * 60 // 15 phút

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `login_attempts:${ip}`

  const attempts = (await redis.get<number>(key)) ?? 0
  if (attempts >= MAX_ATTEMPTS) {
    return Response.json({ error: 'Quá nhiều lần thử. Thử lại sau 15 phút.' }, { status: 429 })
  }

  const { password } = await req.json().catch(() => ({}))

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    await redis.set(key, attempts + 1, { ex: LOCKOUT_SECONDS })
    return Response.json({ error: 'Sai mật khẩu' }, { status: 401 })
  }

  // Login thành công — xóa counter và set cookie với session token (không phải password)
  await redis.del(key)
  const sessionToken = process.env.DASHBOARD_TOKEN ?? process.env.DASHBOARD_PASSWORD ?? ''

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `auth=${sessionToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`,
    },
  })
}
