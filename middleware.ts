import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/login', '/api/auth']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const auth = req.cookies.get('auth')?.value
  const validToken = process.env.DASHBOARD_TOKEN ?? process.env.DASHBOARD_PASSWORD
  if (auth && auth === validToken) return NextResponse.next()

  return NextResponse.redirect(new URL('/login', req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
