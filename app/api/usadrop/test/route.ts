export async function GET() {
  const email = process.env.USADROP_EMAIL ?? ''
  const password = process.env.USADROP_PASSWORD ?? ''

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://app.usadrop.com',
    'Referer': 'https://app.usadrop.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  }

  // Try both Account and email field names
  const [r1, r2] = await Promise.all([
    fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
      method: 'POST', headers,
      body: JSON.stringify({ Account: email, Password: password }),
    }),
    fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
      method: 'POST', headers,
      body: JSON.stringify({ email, password }),
    }),
  ])

  return Response.json({
    withAccount: { status: r1.status, body: (await r1.text()).slice(0, 400) },
    withEmail: { status: r2.status, body: (await r2.text()).slice(0, 400) },
  })
}
