'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type JoinedData<T> = T | T[] | null

interface Report {
  id: string
  reason: string
  description: string | null
  is_reviewed: boolean
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
  item: JoinedData<{ id: string; title: string; status: string }>
  reporter: JoinedData<{ id: string; full_name: string | null; email: string }>
}

const ITEMS_PER_PAGE = 20

const REPORT_STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'unreviewed', label: '미처리' },
  { value: 'reviewed', label: '처리완료' },
]

const REPORT_REASON_OPTIONS = [
  { value: '', label: '전체 사유' },
  { value: 'prohibited_item', label: '금지 품목' },
  { value: 'fraud', label: '사기' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'wrong_category', label: '잘못된 카테고리' },
  { value: 'duplicate', label: '중복 게시' },
  { value: 'other', label: '기타' },
]

function MarketplaceReportsContent() {
  const searchParams = useSearchParams()
  const [reports, setReports] = useState<Report[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [reasonFilter, setReasonFilter] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('marketplace_item_reports')
        .select(`
          id, reason, description, is_reviewed, admin_notes, reviewed_at, created_at,
          item:marketplace_items(id, title, status),
          reporter:users(id, full_name, email)
        `, { count: 'exact' })

      if (statusFilter === 'unreviewed') {
        query = query.eq('is_reviewed', false)
      } else if (statusFilter === 'reviewed') {
        query = query.eq('is_reviewed', true)
      }

      if (reasonFilter) {
        query = query.eq('reason', reasonFilter)
      }

      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      setReports((data as Report[]) || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, reasonFilter])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleReportAction = async (reportId: string, action: string, notes?: string) => {
    try {
      let updateData: Record<string, unknown> = {}

      switch (action) {
        case 'review':
          updateData = {
            is_reviewed: true,
            reviewed_at: new Date().toISOString(),
            admin_notes: notes || '검토 완료',
          }
          break
        case 'dismiss':
          updateData = {
            is_reviewed: true,
            reviewed_at: new Date().toISOString(),
            admin_notes: notes || '신고 기각',
          }
          break
        default:
          return
      }

      const { error } = await supabase
        .from('marketplace_item_reports')
        .update(updateData)
        .eq('id', reportId)

      if (error) throw error

      setActionMenuOpen(null)
      loadReports()
    } catch (error) {
      console.error('Error performing action:', error)
      alert('작업 중 오류가 발생했습니다.')
    }
  }

  const handleHideItem = async (itemId: string, reportId: string) => {
    try {
      // Hide the item
      const { error: itemError } = await supabase
        .from('marketplace_items')
        .update({ status: 'hidden' })
        .eq('id', itemId)

      if (itemError) throw itemError

      // Mark report as reviewed
      await handleReportAction(reportId, 'review', '아이템 숨김 처리됨')
    } catch (error) {
      console.error('Error hiding item:', error)
      alert('아이템 숨김 처리 중 오류가 발생했습니다.')
    }
  }

  const getReasonBadge = (reason: string) => {
    const styles: Record<string, string> = {
      prohibited_item: 'bg-red-100 text-red-800',
      fraud: 'bg-red-100 text-red-800',
      inappropriate: 'bg-orange-100 text-orange-800',
      wrong_category: 'bg-yellow-100 text-yellow-800',
      duplicate: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return styles[reason] || 'bg-gray-100 text-gray-800'
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      prohibited_item: '금지 품목',
      fraud: '사기',
      inappropriate: '부적절',
      wrong_category: '잘못된 카테고리',
      duplicate: '중복',
      other: '기타',
    }
    return labels[reason] || reason
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">신고 관리</h1>
        <button
          onClick={loadReports}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          새로고침
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {REPORT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {REPORT_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600">
            총 {totalCount}건
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            신고 내역이 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    사유
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    신고된 아이템
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    신고자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    등록일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => {
                  const item = Array.isArray(report.item) ? report.item[0] : report.item
                  const reporter = Array.isArray(report.reporter) ? report.reporter[0] : report.reporter
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReasonBadge(report.reason)}`}>
                          {getReasonLabel(report.reason)}
                        </span>
                        {report.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate max-w-[200px]">
                            {report.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item ? (
                          <div>
                            <Link
                              href={`/admin/marketplace/items/${item.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {item.title}
                            </Link>
                            <div className="text-xs text-gray-400">
                              상태: {item.status === 'hidden' ? '숨김' : item.status === 'active' ? '판매중' : item.status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">삭제된 아이템</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{reporter?.full_name || '-'}</div>
                        <div className="text-gray-500">{reporter?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.is_reviewed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {report.is_reviewed ? '처리완료' : '미처리'}
                        </span>
                        {report.admin_notes && (
                          <p className="mt-1 text-xs text-gray-500 truncate max-w-[150px]">
                            {report.admin_notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(report.created_at)}
                        {report.reviewed_at && (
                          <div className="text-xs text-gray-400">
                            처리: {formatDate(report.reviewed_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === report.id ? null : report.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        {actionMenuOpen === report.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              {item && (
                                <Link
                                  href={`/admin/marketplace/items/${item.id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="w-4 h-4 mr-2" /> 아이템 보기
                                </Link>
                              )}
                              {!report.is_reviewed && (
                                <>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'review')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" /> 처리 완료
                                  </button>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'dismiss')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" /> 기각
                                  </button>
                                  {item && item.status !== 'hidden' && (
                                    <button
                                      onClick={() => handleHideItem(item.id, report.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                      <AlertTriangle className="w-4 h-4 mr-2" /> 아이템 숨김
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} / {totalCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketplaceReportsPage() {
  return (
    <Suspense fallback={<div className="bg-white shadow rounded-lg p-6"><div className="text-center">로딩 중...</div></div>}>
      <MarketplaceReportsContent />
    </Suspense>
  )
}