export async function GET() {
  const email = process.env.USADROP_EMAIL ?? ''
  const password = process.env.USADROP_PASSWORD ?? ''

  const res = await fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Account: email, Password: password }),
  })
  const text = await res.text()
  return Response.json({
    status: res.status,
    body: text.slice(0, 600),
    debug: {
      hasEmail: email.length > 0,
      emailPrefix: email.slice(0, 6),
      hasPwd: password.length > 0,
    },
  })
}
