export async function GET() {
  const email = process.env.USADROP_EMAIL ?? ''
  const pwd = process.env.USADROP_PASSWORD ?? ''

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://app.usadrop.com',
    'Referer': 'https://app.usadrop.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  }

  const variants = [
    { email, pwd },
    { email, Pwd: pwd },
    { email, passWord: pwd },
    { email, loginPwd: pwd },
    { email, loginPassword: pwd },
    { email, password: pwd },
  ]

  const results: Record<string, unknown>[] = []
  for (const body of variants) {
    const r = await fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
      method: 'POST', headers, body: JSON.stringify(body),
    })
    const text = await r.text()
    const code = JSON.parse(text)?.code ?? JSON.parse(text)?.ErrCode ?? 'unknown'
    results.push({ fields: Object.keys(body).join('+'), code })
  }

  return Response.json({ results, pwdLen: pwd.length, pwdStart: pwd.slice(0, 3) })
}
