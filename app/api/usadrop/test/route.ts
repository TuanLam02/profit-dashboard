const CANDIDATES = [
  'https://app.usadrop.com/api/Member/Login',
  'https://app.usadrop.com/api/member/login',
  'https://app.usadrop.com/api/Account/Login',
  'https://app.usadrop.com/api/Auth/Login',
  'https://app.usadrop.com/api/login',
  'https://app.usadrop.com/api/Member/LoginByEmail',
]

export async function GET() {
  const email = process.env.USADROP_EMAIL ?? 'NOT SET'
  const hasPassword = !!process.env.USADROP_PASSWORD
  const body = JSON.stringify({ UserName: process.env.USADROP_EMAIL, Password: process.env.USADROP_PASSWORD })

  const results: Record<string, unknown>[] = []
  for (const url of CANDIDATES) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const text = await res.text()
      results.push({ url, status: res.status, body: text.slice(0, 200) })
    } catch (e) {
      results.push({ url, error: String(e) })
    }
  }

  return Response.json({ email, hasPassword, results })
}
