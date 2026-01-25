'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Car,
  DollarSign,
} from 'lucide-react'

interface CarRequest {
  id: string
  user_id: string | null
  contact_name: string
  contact_phone: string | null
  contact_email: string | null
  preferred_make: string | null
  preferred_model: string | null
  preferred_year_min: number | null
  preferred_year_max: number | null
  budget_min: number | null
  budget_max: number | null
  preferred_fuel_type: string | null
  preferred_transmission: string | null
  preferred_location: string | null
  description: string | null
  status: string
  created_at: string
}

export default function CarRequestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [requests, setRequests] = useState<CarRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const pageSize = 20

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('car_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (searchTerm) {
        query = query.or(`contact_name.ilike.%${searchTerm}%,preferred_make.ilike.%${searchTerm}%,preferred_model.ilike.%${searchTerm}%`)
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error, count } = await query

      if (error) throw error

      setRequests(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading car requests:', error)
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, statusFilter])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (statusFilter) params.set('status', statusFilter)
    if (page > 1) params.set('page', page.toString())
    router.push(`/admin/used-cars/requests?${params.toString()}`, { scroll: false })
  }, [searchTerm, statusFilter, page, router])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      MATCHED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '대기중',
      IN_PROGRESS: '진행중',
      MATCHED: '매칭됨',
      COMPLETED: '완료',
      CANCELLED: '취소',
    }
    return labels[status] || status
  }

  const getFuelTypeLabel = (type: string | null) => {
    if (!type) return '-'
    const labels: Record<string, string> = {
      GASOLINE: '가솔린',
      DIESEL: '디젤',
      HYBRID: '하이브리드',
      ELECTRIC: '전기',
      LPG: 'LPG',
    }
    return labels[type] || type
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">차량 요청 관리</h1>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 제조사, 모델 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            <option value="PENDING">대기중</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="MATCHED">매칭됨</option>
            <option value="COMPLETED">완료</option>
            <option value="CANCELLED">취소</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        총 {totalCount}건의 요청
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">요청이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    희망 차량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예산
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조건
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.contact_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.contact_phone || request.contact_email || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {request.preferred_make || '제조사 무관'} {request.preferred_model || ''}
                          </div>
                          {(request.preferred_year_min || request.preferred_year_max) && (
                            <div className="text-sm text-gray-500">
                              {request.preferred_year_min || '?'} - {request.preferred_year_max || '?'}년식
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {request.budget_min || request.budget_max ? (
                            <>
                              {formatPrice(request.budget_min)} ~ {formatPrice(request.budget_max)}
                            </>
                          ) : (
                            '예산 무관'
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div>{getFuelTypeLabel(request.preferred_fuel_type)}</div>
                        <div>{request.preferred_transmission === 'AUTOMATIC' ? '자동' : request.preferred_transmission === 'MANUAL' ? '수동' : '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(request.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/used-cars/requests/${request.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} / {totalCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
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