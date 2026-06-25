export async function GET() {
  const email = process.env.USADROP_EMAIL ?? 'NOT SET'
  const hasPassword = !!process.env.USADROP_PASSWORD
  const loginBody = JSON.stringify({ UserName: process.env.USADROP_EMAIL, Password: process.env.USADROP_PASSWORD })
  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://app.usadrop.com',
    'Referer': 'https://app.usadrop.com/',
    'X-Requested-With': 'XMLHttpRequest',
  }

  // Try login with different URLs + content-types
  const results: Record<string, unknown>[] = []

  // JSON POST attempts
  for (const url of [
    'https://app.usadrop.com/api/Member/Login',
    'https://app.usadrop.com/api/Member/LoginByUserName',
    'https://app.usadrop.com/api/login',
    'https://app.usadrop.com/connect/token',
  ]) {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: loginBody })
      const text = await res.text()
      results.push({ url, method: 'POST JSON', status: res.status, body: text.slice(0, 200) })
    } catch (e) {
      results.push({ url, error: String(e) })
    }
  }

  // Form-encoded POST (OAuth style)
  try {
    const formBody = new URLSearchParams({
      grant_type: 'password',
      username: process.env.USADROP_EMAIL ?? '',
      password: process.env.USADROP_PASSWORD ?? '',
      client_id: 'lh',
    })
    const res = await fetch('https://app.usadrop.com/connect/token', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    })
    const text = await res.text()
    results.push({ url: '/connect/token', method: 'POST form', status: res.status, body: text.slice(0, 200) })
  } catch (e) {
    results.push({ url: '/connect/token form', error: String(e) })
  }

  return Response.json({ email, hasPassword, results })
}
