import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check for admin token
  const adminToken = req.cookies.get('admin-token')
  const adminSession = adminToken ? await verifyAdminSession(adminToken.value) : null

  // 루트 경로 처리
  if (req.nextUrl.pathname === '/') {
    if (adminSession) {
      return NextResponse.redirect(new URL('/admin', req.url))
    } else {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Admin login page - allow access if not already logged in
  if (req.nextUrl.pathname === '/admin/login') {
    if (adminSession) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return res
  }

  // Admin routes - require authentication
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for login, signup pages and API routes
    if (req.nextUrl.pathname === '/admin/login' || 
        req.nextUrl.pathname === '/admin/signup' ||
        req.nextUrl.pathname.startsWith('/api/admin/')) {
      return res
    }
    
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
