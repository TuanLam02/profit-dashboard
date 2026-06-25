export async function GET() {
  const res = await fetch('https://webapi.usadrop.com/api/Login/getAuthorization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      UserName: process.env.USADROP_EMAIL,
      Password: process.env.USADROP_PASSWORD,
    }),
  })
  const text = await res.text()
  return Response.json({ status: res.status, body: text.slice(0, 500) })
}
