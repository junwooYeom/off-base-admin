'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Calendar, User, Home, CheckCircle, XCircle, Clock } from 'lucide-react'

interface PropertyReport {
  id: string
  property_id: string
  reporter_id: string
  reason: string
  description?: string
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED'
  created_at: string
  updated_at: string
  property?: {
    id: string
    title: string
    address: string
    user?: {
      id: string
      email: string
      full_name?: string
    }
  }
  reporter?: {
    id: string
    email: string
    full_name?: string
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<PropertyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED'>('PENDING')
  const [selectedReport, setSelectedReport] = useState<PropertyReport | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionNotes, setActionNotes] = useState('')

  useEffect(() => {
    loadReports()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadReports = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('property_reports')
        .select(`
          *,
          property:properties!property_id (
            id,
            title,
            address,
            user:users!user_id (
              id,
              email,
              full_name
            )
          ),
          reporter:users!reporter_id (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'ALL') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: PropertyReport['status']) => {
    try {
      const { error } = await supabase
        .from('property_reports')
        .update({
          status: newStatus,
          admin_notes: actionNotes || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error

      await loadReports()
      setShowDetailModal(false)
      setSelectedReport(null)
      setActionNotes('')
    } catch (error) {
      console.error('Error updating report status:', error)
    }
  }

  const getStatusColor = (status: PropertyReport['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWING': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'DISMISSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: PropertyReport['status']) => {
    switch (status) {
      case 'PENDING': return '대기중'
      case 'REVIEWING': return '검토중'
      case 'RESOLVED': return '해결됨'
      case 'DISMISSED': return '기각됨'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">신고 관리</h1>
          <p className="text-gray-600 mt-1">매물 신고 내역을 확인하고 처리합니다</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-200">
        {(['ALL', 'PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filter === status
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {status === 'ALL' ? '전체' : getStatusText(status)}
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {reports.filter(r => status === 'ALL' || r.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    {report.reason}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        {report.property?.title || 'Unknown Property'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        신고자: {report.reporter?.email || 'Unknown'}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                  {getStatusText(report.status)}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">신고 내용</p>
                  <p className="text-gray-900">{report.description || '상세 내용 없음'}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">매물 주소</p>
                    <p className="font-medium text-sm">{report.property?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">매물 소유자</p>
                    <p className="font-medium text-sm">{report.property?.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">신고일</p>
                    <p className="font-medium text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">최종 수정일</p>
                    <p className="font-medium text-sm">
                      {new Date(report.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {report.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setSelectedReport(report)
                        setShowDetailModal(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      검토 시작
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      해결됨
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'DISMISSED')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      기각
                    </button>
                  </div>
                )}

                {report.status === 'REVIEWING' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      해결 완료
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'DISMISSED')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      기각
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'ALL' ? '신고 내역이 없습니다' :
             `${getStatusText(filter)} 상태의 신고가 없습니다`}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">신고 상세 정보</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">신고 사유</label>
                <p className="mt-1 text-gray-900">{selectedReport.reason}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">상세 내용</label>
                <p className="mt-1 text-gray-900">{selectedReport.description || '없음'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">처리 메모</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="처리 내용이나 메모를 입력하세요..."
                  className="mt-1 w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'REVIEWING')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                검토중으로 변경
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedReport(null)
                  setActionNotes('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}