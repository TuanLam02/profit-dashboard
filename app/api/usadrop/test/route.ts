export async function GET() {
  const creds = { UserName: process.env.USADROP_EMAIL, Password: process.env.USADROP_PASSWORD }

  const [r1, r2] = await Promise.all([
    fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds),
    }),
    fetch('https://webapi.usadrop.com/api/Login/NyToken', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds),
    }),
  ])

  return Response.json({
    GetJwtToken: { status: r1.status, body: (await r1.text()).slice(0, 400) },
    NyToken: { status: r2.status, body: (await r2.text()).slice(0, 400) },
  })
}
