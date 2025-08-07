'use client'

import { useState, useEffect } from 'react'
import { adminQueries } from '@/lib/supabase-admin'
import { UserWithCompat, toUserWithCompat } from '@/types/compatibility'
import RoleChangeModal from '@/components/RoleChangeModal'
import DocumentReviewModal from '@/components/DocumentReviewModal'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithCompat[]>([])
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [selectedUser] = useState<UserWithCompat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const router = useRouter()
  const { } = useAuth()

  // 초기 데이터 로드
  useEffect(() => {
    loadUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await adminQueries.users.getAll({
        status: filter === 'ALL' ? undefined : filter
      })
      if (error) throw error
      setUsers((data || []).map(u => toUserWithCompat(u)))
    } catch (error) {
      console.log('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`상태를 ${status === 'APPROVED' ? '승인' : '거절'}로 변경하시겠습니까?`)) {
      return
    }
    
    try {
      const { error } = await adminQueries.users.updateStatus(userId, status)
      if (error) {
        console.error('Status update error:', error)
        alert(`상태 업데이트 실패: ${error.message}`)
        throw error
      }
      alert('상태가 성공적으로 업데이트되었습니다.')
      await loadUsers()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">유저 검증</h1>
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                  ${filter === status
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {status === 'ALL' ? '전체' :
                 status === 'PENDING' ? '대기중' :
                 status === 'APPROVED' ? '승인됨' : '거절됨'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.full_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.user_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.verification_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    user.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.verification_status === 'APPROVED' ? '승인됨' :
                     user.verification_status === 'PENDING' ? '대기중' : '거절됨'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    상세보기
                  </button>
                  <button
                    className="text-purple-600 hover:text-purple-900 mr-2"
                    onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                  >
                    편집
                  </button>
                  {user.verification_status === 'PENDING' && (
                    <>
                      <button
                        className="text-green-600 hover:text-green-900 mr-2"
                        onClick={() => handleStatusUpdate(user.id, 'APPROVED')}
                      >
                        승인
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                      >
                        거절
                      </button>
                    </>
                  )}
                  {user.verification_status === 'APPROVED' && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                    >
                      승인 취소
                    </button>
                  )}
                  {user.verification_status === 'REJECTED' && (
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => handleStatusUpdate(user.id, 'APPROVED')}
                    >
                      재승인
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <>
          <RoleChangeModal
            isOpen={isRoleModalOpen}
            onClose={() => setIsRoleModalOpen(false)}
            userId={selectedUser.id}
            currentRole={selectedUser.user_type}
            onRoleChange={loadUsers}
          />
          <DocumentReviewModal
            isOpen={isDocModalOpen}
            onClose={() => setIsDocModalOpen(false)}
            documents={selectedUser.documents || []}
            onStatusChange={loadUsers}
          />
        </>
      )}
    </div>
  )
} 