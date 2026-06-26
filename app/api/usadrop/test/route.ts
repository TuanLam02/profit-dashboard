export async function GET() {
  const email = process.env.USADROP_EMAIL ?? ''
  const pwd = process.env.USADROP_PASSWORD ?? ''

  const res = await fetch('https://webapi.usadrop.com/api/Login/GetJwtToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://app.usadrop.com',
      'Referer': 'https://app.usadrop.com/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({ email, pwd }),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  const token = data?.data?.token ?? data?.data?.Token ?? data?.Token ?? data?.Data?.Token ?? ''
  const refresh = data?.data?.refreshToken ?? data?.data?.RefreshToken ?? data?.RefreshToken ?? ''

  return Response.json({
    code: data?.code,
    success: data?.success ?? data?.Success,
    tokenFound: !!token,
    tokenPreview: token.slice(0, 40) + '...',
    refreshFound: !!refresh,
    dataKeys: Object.keys(data?.data ?? {}),
  })
}
