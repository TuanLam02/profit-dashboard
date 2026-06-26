export async function GET() {
  const email = process.env.USADROP_EMAIL ?? ''
  const pwd = process.env.USADROP_PASSWORD ?? ''

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://app.usadrop.com',
    'Referer': 'https://app.usadrop.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  }

  const res = await fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
    method: 'POST', headers,
    body: JSON.stringify({ email, pwd }),
  })
  const text = await res.text()
  return Response.json({ status: res.status, body: text.slice(0, 800) })
}
