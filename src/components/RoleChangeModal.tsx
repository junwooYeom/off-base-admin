import { UserRole } from '@/types'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface RoleChangeModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentRole: UserRole
  onRoleChange: () => void
}

export default function RoleChangeModal({
  isOpen,
  onClose,
  userId,
  currentRole,
  onRoleChange
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleRoleChange = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('users')
        .update({ role: selectedRole })
        .eq('id', userId)

      if (error) throw error
      
      onRoleChange()
      onClose()
    } catch (error) {
      console.error('Error changing role:', error)
      alert('역할 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">역할 변경</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새로운 역할 선택
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="USER">일반 사용자</option>
            <option value="LANDLORD">집주인</option>
            <option value="REALTOR">부동산</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
            onClick={handleRoleChange}
            disabled={isLoading}
          >
            {isLoading ? '변경 중...' : '변경하기'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
} 