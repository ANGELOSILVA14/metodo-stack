import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const PROTECTED = ['/metodo', '/plano', '/resultado']
const AUTH_ONLY = ['/login', '/cadastro']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value
  const user = token ? await verifyToken(token) : null

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL('/metodo', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/metodo', '/plano', '/resultado', '/resultado/:path*', '/login', '/cadastro'],
}
