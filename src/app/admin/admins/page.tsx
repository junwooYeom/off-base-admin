'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, Calendar, CheckCircle, XCircle, Clock, User } from 'lucide-react'

interface Admin {
  id: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
  approved_at?: string
  approved_by?: string
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  useEffect(() => {
    fetchAdmins()
    getCurrentAdmin()
  }, [])

  const getCurrentAdmin = async () => {
    // Get current admin ID from session
    const response = await fetch('/api/admin/current')
    if (response.ok) {
      const data = await response.json()
      setCurrentAdminId(data.id)
    }
  }

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (adminId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const updateData: any = {
        status: newStatus
      }

      if (newStatus === 'APPROVED') {
        updateData.approved_at = new Date().toISOString()
        updateData.approved_by = currentAdminId
      }

      const { error } = await supabase
        .from('admins')
        .update(updateData)
        .eq('id', adminId)

      if (error) throw error

      // Refresh the list
      fetchAdmins()
      
      alert(newStatus === 'APPROVED' ? '관리자가 승인되었습니다.' : '관리자가 거절되었습니다.')
    } catch (error) {
      console.error('Error updating admin status:', error)
      alert('상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            승인됨
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            대기중
          </span>
        )
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            거절됨
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">관리자 계정 관리</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const pendingAdmins = admins.filter(a => a.status === 'PENDING')
  const approvedAdmins = admins.filter(a => a.status === 'APPROVED')
  const rejectedAdmins = admins.filter(a => a.status === 'REJECTED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 계정 관리</h1>
            <p className="text-gray-600 mt-1">관리자 계정 승인 및 관리</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-sm text-gray-600">
              총 {admins.length}명의 관리자
            </span>
          </div>
        </div>
      </div>

      {/* Pending Admins */}
      {pendingAdmins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              승인 대기중인 관리자 ({pendingAdmins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <User className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          신청일: {new Date(admin.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(admin.id, 'APPROVED')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(admin.id, 'REJECTED')}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            활성 관리자 ({approvedAdmins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    승인일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full mr-3">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{admin.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(admin.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.approved_at ? new Date(admin.approved_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rejected Admins */}
      {rejectedAdmins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              거절된 관리자 ({rejectedAdmins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rejectedAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{admin.email}</span>
                    {getStatusBadge(admin.status)}
                  </div>
                  <button
                    onClick={() => handleStatusUpdate(admin.id, 'APPROVED')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    재승인
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}