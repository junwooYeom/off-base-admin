'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Shield } from 'lucide-react'

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
    })
    
    if (response.ok) {
      router.push('/admin/login')
      router.refresh()
    }
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">Off-Base Admin</h1>
              <p className="text-xs text-blue-200">관리자 모드</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  )
}