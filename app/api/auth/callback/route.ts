import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const shop = process.env.SHOPIFY_STORE_DOMAIN

  if (!code) {
    return new Response(`Missing code. Params: ${searchParams.toString()}`, { status: 400 })
  }

  if (!shop) {
    return new Response('Missing SHOPIFY_STORE_DOMAIN env var', { status: 500 })
  }

  if (!process.env.SHOPIFY_CLIENT_ID || !process.env.SHOPIFY_CLIENT_SECRET) {
    return new Response('Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET env var', { status: 500 })
  }

  let token = ''
  let errorMsg = ''

  try {
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    })
    const text = await res.text()
    try {
      const data = JSON.parse(text)
      token = data.access_token ?? ''
      if (!token) errorMsg = `Shopify: ${JSON.stringify(data)}`
    } catch {
      errorMsg = `Shopify returned non-JSON (status ${res.status}): ${text.slice(0, 500)}`
    }
  } catch (e) {
    errorMsg = String(e)
  }

  if (!token) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:white">
        <h2 style="color:#f87171">❌ Lỗi lấy token</h2>
        <pre style="color:#fbbf24;background:#1e293b;padding:16px;border-radius:8px">${errorMsg}</pre>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 400 }
    )
  }

  // Lưu vào Redis nếu có
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
      await redis.set('shopify_token', token)
    }
  } catch { /* Redis optional */ }

  return new Response(
    `<html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:white;max-width:640px;margin:0 auto">
      <h2 style="color:#10b981">✓ Shopify kết nối thành công!</h2>
      <p style="color:#94a3b8">Copy token bên dưới → Vercel → Environment Variables → thêm <code>SHOPIFY_ADMIN_TOKEN</code> → Redeploy.</p>
      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:16px;margin:20px 0">
        <p style="color:#64748b;font-size:12px;margin:0 0 8px 0">SHOPIFY_ADMIN_TOKEN:</p>
        <p style="color:#34d399;word-break:break-all;font-size:13px;margin:0;font-family:monospace">${token}</p>
      </div>
      <a href="/" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none">Về Dashboard</a>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
