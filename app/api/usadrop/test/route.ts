export async function GET() {
  const email = process.env.USADROP_EMAIL ?? 'NOT SET'
  const hasPassword = !!process.env.USADROP_PASSWORD

  try {
    const res = await fetch('https://app.usadrop.com/api/Member/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserName: process.env.USADROP_EMAIL,
        Password: process.env.USADROP_PASSWORD,
      }),
    })
    const text = await res.text()
    return Response.json({
      email,
      hasPassword,
      httpStatus: res.status,
      response: text.slice(0, 600),
    })
  } catch (e) {
    return Response.json({ email, hasPassword, error: String(e) })
  }
}
