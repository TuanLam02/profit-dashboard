import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const shop = process.env.SHOPIFY_STORE_DOMAIN!

  if (!code) {
    return new Response('Missing code', { status: 400 })
  }

  // Đổi code lấy access token
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  })

  const data = await res.json()
  const token: string = data.access_token

  if (!token) {
    return new Response(`Error: ${JSON.stringify(data)}`, { status: 400 })
  }

  // Lưu token vào Redis KV
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
  await redis.set('shopify_token', token)

  return new Response(
    `<html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:white;max-width:600px;margin:0 auto">
      <h2 style="color:#10b981">✓ Shopify kết nối thành công!</h2>
      <p style="color:#94a3b8">Token đã được lưu vào database.</p>
      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:16px;margin:20px 0">
        <p style="color:#64748b;font-size:12px;margin:0 0 8px">SHOPIFY_ADMIN_TOKEN (copy vào Vercel env vars):</p>
        <code style="color:#34d399;word-break:break-all;font-size:13px">${token}</code>
      </div>
      <p style="color:#94a3b8;font-size:14px">Để hoàn tất: Vào <strong>Vercel → Environment Variables</strong> → thêm <code>SHOPIFY_ADMIN_TOKEN</code> với giá trị trên → Redeploy.</p>
      <a href="/" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none">Về Dashboard</a>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
