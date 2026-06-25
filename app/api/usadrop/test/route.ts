const CANDIDATES = [
  'https://app.usadrop.com/api/Member/Login',
  'https://api.usadrop.com/api/Member/Login',
  'https://api.usadrop.com/Member/Login',
  'https://app.usadrop.com/api/Member/RefreshToken',
]

export async function GET() {
  const email = process.env.USADROP_EMAIL ?? 'NOT SET'
  const hasPassword = !!process.env.USADROP_PASSWORD
  const jsonBody = JSON.stringify({ UserName: process.env.USADROP_EMAIL, Password: process.env.USADROP_PASSWORD })
  const commonHeaders = {
    'Content-Type': 'application/json',
    'Origin': 'https://app.usadrop.com',
    'Referer': 'https://app.usadrop.com/',
  }

  const results: Record<string, unknown>[] = []
  for (const url of CANDIDATES) {
    try {
      const res = await fetch(url, { method: 'POST', headers: commonHeaders, body: jsonBody })
      const text = await res.text()
      results.push({ url, status: res.status, body: text.slice(0, 300) })
    } catch (e) {
      results.push({ url, error: String(e) })
    }
  }

  return Response.json({ email, hasPassword, results })
}
