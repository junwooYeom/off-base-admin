'use client'

import { useState, useEffect } from 'react'
import { adminQueries } from '@/lib/supabase-admin'
import { UserWithCompat, toUserWithCompat } from '@/types/compatibility'
import RoleChangeModal from '@/components/RoleChangeModal'
import DocumentReviewModal from '@/components/DocumentReviewModal'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithCompat[]>([])
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [selectedUser] = useState<UserWithCompat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const router = useRouter()
  const { } = useAuth()

  // 초기 데이터 로드
  useEffect(() => {
    setCurrentPage(1)
    loadUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    loadUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error, count } = await adminQueries.users.getAll({
        status: filter === 'ALL' ? undefined : filter,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      })
      if (error) throw error
      setUsers((data || []).map(u => toUserWithCompat(u)))
      setTotalCount(count || 0)
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
        {users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">사용자가 없습니다</p>
          </div>
        ) : (
          <>
            {totalCount > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 text-sm text-gray-600">
                총 {totalCount}개 중 {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}개 표시
              </div>
            )}
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
            
            {Math.ceil(totalCount / ITEMS_PER_PAGE) > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                이전
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), prev + 1))}
                disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{totalCount}</span>개 중{' '}
                  <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> -{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> 표시
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">이전</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(Math.ceil(totalCount / ITEMS_PER_PAGE))].map((_, index) => {
                    const page = index + 1
                    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === currentPage
                              ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), prev + 1))}
                    disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">다음</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
            )}
          </>
        )}
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