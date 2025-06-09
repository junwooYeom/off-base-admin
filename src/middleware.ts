import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('미들웨어 실행:', req.nextUrl.pathname)
  // 요청 쿠키 전체 출력
  console.log('요청 쿠키:', req.cookies.getAll())

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log('미들웨어 세션:', session)

  // 루트 경로 처리
  if (req.nextUrl.pathname === '/') {
    if (session) {
      console.log('루트 경로 접속, Admin 페이지로 리다이렉트')
      return NextResponse.redirect(new URL('/admin', req.url))
    } else {
      console.log('루트 경로 접속, 로그인 페이지로 리다이렉트')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  if (req.nextUrl.pathname === '/auth/login') {
    if (session) {
      console.log('이미 로그인됨, Admin 페이지로 리다이렉트')
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    console.log('로그인 페이지, 세션 없음')
    return res
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      console.log('세션 없음, 로그인 페이지로 리다이렉트')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    try {
      console.log('Admin 권한 확인 시작')
      const { data: user, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single()
      if (error) {
        console.error('쿼리 에러 발생:', error)
      }
      if (!user) {
        console.error('user 없음! (DB에 해당 id가 없음)')
      } else if (user.user_type !== 'ADMIN') {
        console.error('user.user_type이 ADMIN이 아님:', user.user_type)
      }
      console.log('사용자 데이터:', user)
      if (error || !user || user.user_type !== 'ADMIN') {
        console.error('Admin 권한 확인 실패')
          return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      console.log('Admin 권한 확인 성공')
    } catch (error) {
      console.error('Admin 권한 확인 중 예외 발생:', error)
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  console.log('미들웨어 통과')
  return res
}

export const config = {
  matcher: [
    '/',
    '/admin',
    '/admin/:path*',
    '/auth/login'
  ]
}
