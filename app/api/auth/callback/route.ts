import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

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

  // Ghi token vào .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = fs.readFileSync(envPath, 'utf-8')
  if (envContent.includes('SHOPIFY_ADMIN_TOKEN=')) {
    envContent = envContent.replace(/SHOPIFY_ADMIN_TOKEN=.*/, `SHOPIFY_ADMIN_TOKEN=${token}`)
  } else {
    envContent += `\nSHOPIFY_ADMIN_TOKEN=${token}`
  }
  fs.writeFileSync(envPath, envContent)

  return new Response(
    `<html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:white">
      <h2 style="color:#10b981">✓ Shopify kết nối thành công!</h2>
      <p>Token đã được lưu vào .env.local</p>
      <p style="color:#94a3b8">Token: <code>${token.slice(0, 12)}...</code></p>
      <p>Hãy <strong>restart server</strong> (Ctrl+C rồi npm run dev) rồi vào <a href="/" style="color:#6366f1">Dashboard</a></p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
