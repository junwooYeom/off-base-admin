import { ReactNode } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import EnvironmentBadge from '@/components/EnvironmentBadge'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <EnvironmentBadge />

      {/* Main content area */}
      <div className="pl-64">
        {/* Top header */}
        <AdminHeader />

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}