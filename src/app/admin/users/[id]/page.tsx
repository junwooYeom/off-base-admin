'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserWithCompat, toUserWithCompat } from '@/types/compatibility'
import Image from 'next/image'


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
  })

  const handleStatusChange = async (newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: newStatus })
      .eq('id', userId)
    if (!error) router.push('/admin/users')
    else alert('상태 변경 실패')
  }

  if (isLoading) return <div>로딩 중...</div>
  if (!user) return <div>유저 정보를 불러올 수 없습니다.</div>

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">유저 상세 정보</h2>
      <div className="mb-4">
        <div>이메일: {user.email}</div>
        <div>유형: {user.user_type}</div>
        <div>가입일: {new Date(user.created_at).toLocaleDateString()}</div>
        <div>상태: {user.verification_status}</div>
      </div>
      <h3 className="font-semibold mb-2">제출 파일</h3>
      <ul className="mb-4">
        {false ? (
          []
            .filter(doc => doc.type === 'JPG' || doc.url.endsWith('.jpg') || doc.url.endsWith('.jpeg'))
            .map(doc => (
              <li key={doc.id} className="mb-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                  download
                >
                  {doc.type || 'JPG 파일'} 다운로드
                </a>
                {/* 미리보기 */}
                <div className="mt-2">
                  <Image src={doc.url} alt="제출 파일 미리보기" width={320} height={240} className="max-w-xs border" />
                </div>
              </li>
            ))
        ) : (
          <li>제출된 JPG 파일이 없습니다.</li>
        )}
      </ul>
      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => handleStatusChange('ALLOWED')}
        >
          승인
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => handleStatusChange('REJECTED')}
        >
          거절
        </button>
      </div>
    </div>
  )
} 