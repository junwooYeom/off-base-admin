'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const processSocialLogin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        alert('로그인 실패')
        router.replace('/auth/login')
        return
      }

      // 모바일 앱 여부 판단 (User-Agent에 'Humpreys/1.0.0' 포함 시)
      const ua = navigator.userAgent.toLowerCase()
      const isHumpreysApp = ua.includes('humpreys/1.0.0')
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (isHumpreysApp && code) {
        // Humpreys 앱(Android/iOS)이면 딥링크로 리다이렉트
        // 'offbase://auth'는 Android/iOS 앱 모두에서 등록된 딥링크 스킴이어야 합니다.
        window.location.href = `offbase://auth?code=${code}`
        return
      }

      // users 테이블에서 email로 조회
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)

      if (userError) {
        alert('유저 조회 실패')
        router.replace('/auth/login')
        return
      }

      if (!users || users.length === 0) {
        // 없으면 새로 생성 (ADMIN, ALLOWED, 소셜 데이터)
        const profileImage = user.user_metadata?.avatar_url || ''
        const fullName = user.email
        const nickname = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.displayName || ''

        const { error: insertError } = await supabase.from('users').insert([{
          id: user.id,
          email: user.email,
          user_type: 'ADMIN',
          waiting_status: 'ALLOWED',
          profile_image: profileImage,
          full_name: fullName,
          nickname: nickname
        }])

        if (insertError) {
          alert('유저 생성 실패')
          router.replace('/auth/login')
          return
        }
        // 바로 어드민 페이지로 이동
        router.replace('/admin')
        return
      }

      // 이미 있으면 user_type 체크
      const foundUser = users[0]
      if (foundUser.user_type !== 'ADMIN') {
        alert('관리자만 접근할 수 있습니다.')
        await supabase.auth.signOut()
        router.replace('/auth/login')
        return
      }

      // ADMIN이면 어드민 페이지로 이동
      router.replace('/admin')
    }

    processSocialLogin()
  }, [router])

  return <div>로그인 처리 중...</div>
}

/*
[User-Agent 커스텀 방식 안내]
- 모바일 앱에서 OAuth 인증 브라우저를 띄울 때 User-Agent에 'offbaseandroid' (Android) 등 고유 문자열을 추가하세요.
- 예시 (Android WebView):
  webView.getSettings().setUserAgentString(
    webView.getSettings().getUserAgentString() + " offbaseandroid"
  );
- iOS도 마찬가지로 User-Agent에 고유 문자열 추가 가능
- 이 문자열로 웹에서 앱 접근 여부를 쉽게 구분할 수 있습니다.
*/ 