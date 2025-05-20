'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 상태인지 확인
    const checkSession = async () => {
      console.log('초기 세션 체크 시작')
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('초기 세션 데이터:', session)
      console.log('초기 세션 에러:', error)
      if (session) {
        console.log('세션 존재, Admin 페이지로 이동 시도')
        router.replace('/admin')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      console.log('로그인 시도:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('로그인 응답:', data)
      console.log('로그인 에러:', error)

      if (error) {
        console.error('로그인 에러 발생:', error.message)
        alert(error.message)
        return
      }

      if (data.session) {
        console.log('로그인 성공, 세션 데이터:', data.session)
        try {
          // 로그인 성공 후 세션이 설정될 때까지 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 세션 재확인
          const { data: { session } } = await supabase.auth.getSession()
          console.log('최종 세션 확인:', session)
          
          if (session) {
            console.log('세션 확인 완료, Admin 페이지로 이동 시도')
            router.replace('/admin')
          } else {
            console.error('세션 설정 실패')
            alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
          }
        } catch (error) {
          console.error('페이지 이동 중 에러:', error)
          alert('페이지 이동 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
      } else {
        console.error('세션이 없습니다')
        alert('로그인에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('로그인 처리 중 예외 발생:', error)
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                이메일
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 