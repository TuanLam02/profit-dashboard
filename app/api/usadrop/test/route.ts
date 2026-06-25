export async function GET() {
  // Search app.chunk for all webapi.usadrop.com paths
  const js = await fetch('https://app.usadrop.com/js/app.chunk.1782214963872.js')
    .then(r => r.text()).catch(() => '')

  const webapiPaths = [...js.matchAll(/["'`]((?:https:\/\/webapi\.usadrop\.com)?\/api\/[^"'`\s]{3,60})["'`]/g)]
    .map(m => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()

  // Also try getAuthBack
  const res = await fetch('https://webapi.usadrop.com/api/Login/getAuthBack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ UserName: process.env.USADROP_EMAIL, Password: process.env.USADROP_PASSWORD }),
  })
  const text = await res.text()

  return Response.json({ getAuthBack: { status: res.status, body: text.slice(0, 300) }, webapiPaths })
}
