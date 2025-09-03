'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserWithCompat, toUserWithCompat } from '@/types/compatibility'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Calendar, Shield } from 'lucide-react'


export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserWithCompat | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (!error && data) setUser(toUserWithCompat(data))
      setIsLoading(false)
    }
    fetchUser()
  }, [userId]) // Add dependency array to prevent infinite loop


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">사용자를 찾을 수 없습니다.</p>
        <Link href="/admin/users" className="text-blue-600 hover:underline mt-4 inline-block">
          ← 사용자 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">사용자 상세 정보</h1>
              <p className="text-gray-600 mt-1">{user.full_name || user.email}</p>
            </div>
          </div>
          <Link 
            href={`/admin/users/${userId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            편집
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          기본 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">이메일:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">사용자 유형:</span>
            <span className="font-medium">
              {user.user_type === 'ADMIN' ? '관리자' :
               user.user_type === 'REALTOR' ? '공인중개사' :
               user.user_type === 'LANDLORD' ? '임대인' : '세입자'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">가입일:</span>
            <span className="font-medium">{new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 