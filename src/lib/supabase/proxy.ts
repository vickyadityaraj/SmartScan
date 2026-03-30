import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  const currentPath = request.nextUrl.pathname

  let user: { id: string } | null = null
  let role: string | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret)
      user = { id: payload.userId as string }
      role = payload.role as string
    } catch (err) {
      // Invalid token
    }
  }

  // Auth Redirects
  const isAuthRoute = currentPath.startsWith('/login') || currentPath.startsWith('/signup') || currentPath.startsWith('/auth')
  const isRoot = currentPath === '/'

  if (!user && !isAuthRoute && !isRoot) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Redirect authenticated users away from login/root
    if (isAuthRoute || isRoot) {
      let redirectPath = '/customer'
      if (role === 'admin') redirectPath = '/admin/users'
      else if (role === 'security') redirectPath = '/security'
      else if (role === 'management') redirectPath = '/management'
      
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // Role-based route protection
    if (currentPath.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (currentPath.startsWith('/security') && !['security', 'admin'].includes(role || '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (currentPath.startsWith('/management') && !['management', 'admin'].includes(role || '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (currentPath.startsWith('/customer') && role !== 'customer' && role !== 'admin') {
       // Support admin viewing customer area
    }
  }

  return NextResponse.next()
}
