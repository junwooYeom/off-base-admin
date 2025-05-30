'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export default function RealtorPendingPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'REALTOR')
      .eq('waiting_status', 'PENDING')
    if (!error && data) setUsers(data)
    setIsLoading(false)
  }

  const handleStatusChange = async (userId: string, newStatus: User['waiting_status']) => {
    const { error } = await supabase
      .from('users')
      .update({ waiting_status: newStatus })
      .eq('id', userId)
    if (!error) loadUsers()
    else alert('상태 변경 실패')
  }

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">승인 대기 중인 부동산 목록</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">승인/거절</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.waiting_status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select
                  value={user.waiting_status}
                  onChange={e => handleStatusChange(user.id, e.target.value as User['waiting_status'])}
                  className="border rounded px-2 py-1"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ALLOWED">ALLOWED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
