import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token: any = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isVerifyPhonePage = request.nextUrl.pathname.startsWith('/verify-phone')
  

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return null
  }

  if (isAuth) {
    let from = request.nextUrl.pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }

    
    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  // Check if user has verified phone number
  if (token && !token.phoneVerified && !isVerifyPhonePage) {
    return NextResponse.redirect(new URL('/verify-phone', request.url))
  }

  // Role-based access control
  if (isAdminPage && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/admin/:path*',
    '/verify-phone',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}