export async function GET() {
  // Search USADROP JS bundle for login endpoint — no auth needed
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
