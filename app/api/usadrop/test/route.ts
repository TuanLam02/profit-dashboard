import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })

export async function GET() {
  const token = await redis.get<string>('usadrop_jwt')
  if (!token) return Response.json({ error: 'No token in Redis' })

  const headers = { Authorization: `Bearer ${token}` }

  // Search USADROP JS bundle for login endpoint
  const html = await fetch('https://app.usadrop.com/').then(r => r.text()).catch(() => '')

  // Find JS bundle URLs
  const jsUrls = [...html.matchAll(/src="([^"]*\.js[^"]*)"/g)].map(m => m[1])
    .filter(u => u.includes('chunk') || u.includes('app'))
    .map(u => u.startsWith('http') ? u : `https://app.usadrop.com${u}`)
    .slice(0, 3)

  const loginMatches: string[] = []
  for (const url of jsUrls) {
    const js = await fetch(url).then(r => r.text()).catch(() => '')
    // Search for login-related API paths
    const matches = [...js.matchAll(/["'`]([^"'`]*[Ll]ogin[^"'`]*)["'`]/g)]
      .map(m => m[1])
      .filter(s => s.includes('/api/') || s.includes('Member') || s.includes('Auth'))
      .slice(0, 10)
    loginMatches.push(...matches)
  }

  return Response.json({ jsUrls, loginMatches: [...new Set(loginMatches)] })
}
