import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const shop = process.env.SHOPIFY_STORE_DOMAIN!
  const clientId = process.env.SHOPIFY_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
  const scopes = 'read_orders,read_products'
  const state = crypto.randomUUID()

  const url =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`

  return Response.redirect(url)
}
