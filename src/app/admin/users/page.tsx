'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import RoleChangeModal from '@/components/RoleChangeModal'
import DocumentReviewModal from '@/components/DocumentReviewModal'
import { useRouter } from 'next/navigation'

async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*, documents(*)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as User[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [selectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 초기 데이터 로드
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">유저 관리</h2>
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  문서 상태
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users
                .filter(user => user.user_type === 'REALTOR' && user.waiting_status === 'PENDING')
                .map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.user_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.waiting_status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
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