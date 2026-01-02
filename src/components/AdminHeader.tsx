'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, Bell } from 'lucide-react'

type AdminInfo = {
  id: string
  email: string
  is_super_admin: boolean
}

export default function AdminHeader() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminInfo | null>(null)

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch('/api/admin/current')
        if (response.ok) {
          const data = await response.json()
          setAdmin(data)
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error)
      }
    }
    fetchAdmin()
  }, [])

  const handleLogout = async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
    })

    if (response.ok) {
      router.push('/admin/auth/login')
      router.refresh()
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page title area - can be dynamic */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">관리자 대시보드</h2>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications placeholder */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="flex items-center justify-center h-9 w-9 bg-blue-100 text-blue-600 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {admin?.email || '로딩 중...'}
              </p>
              <p className="text-xs text-gray-500">
                {admin?.is_super_admin ? '슈퍼 관리자' : '관리자'}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="로그아웃"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  )
}