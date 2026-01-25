'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  Car,
} from 'lucide-react'

interface Inquiry {
  id: string
  car_id: string
  contact_name: string
  contact_phone: string | null
  contact_email: string | null
  message: string | null
  inquiry_type: string
  status: string
  admin_notes: string | null
  created_at: string
  car: { id: string; title: string } | { id: string; title: string }[] | null
}

export default function InquiriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [carIdFilter, setCarIdFilter] = useState(searchParams.get('car_id') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const pageSize = 20

  const loadInquiries = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('car_inquiries')
        .select(`
          id, car_id, contact_name, contact_phone, contact_email, message, inquiry_type, status, admin_notes, created_at,
          car:used_cars(id, title)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (searchTerm) {
        query = query.or(`contact_name.ilike.%${searchTerm}%,contact_phone.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`)
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      if (typeFilter) {
        query = query.eq('inquiry_type', typeFilter)
      }

      if (carIdFilter) {
        query = query.eq('car_id', carIdFilter)
      }

      const { data, error, count } = await query

      if (error) throw error

      setInquiries(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading inquiries:', error)
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, statusFilter, typeFilter, carIdFilter])

  useEffect(() => {
    loadInquiries()
  }, [loadInquiries])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    if (carIdFilter) params.set('car_id', carIdFilter)
    if (page > 1) params.set('page', page.toString())
    router.push(`/admin/used-cars/inquiries?${params.toString()}`, { scroll: false })
  }, [searchTerm, statusFilter, typeFilter, carIdFilter, page, router])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-red-100 text-red-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      SPAM: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: '신규',
      CONTACTED: '연락완료',
      IN_PROGRESS: '진행중',
      CLOSED: '종료',
      SPAM: '스팸',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      GENERAL: '일반문의',
      PRICE: '가격문의',
      TEST_DRIVE: '시승신청',
      PURCHASE: '구매문의',
      OTHER: '기타',
    }
    return labels[type] || type
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

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">문의 관리</h1>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 연락처, 이메일 검색..."
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
            <option value="NEW">신규</option>
            <option value="CONTACTED">연락완료</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="CLOSED">종료</option>
            <option value="SPAM">스팸</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 유형</option>
            <option value="GENERAL">일반문의</option>
            <option value="PRICE">가격문의</option>
            <option value="TEST_DRIVE">시승신청</option>
            <option value="PURCHASE">구매문의</option>
            <option value="OTHER">기타</option>
          </select>
          {carIdFilter && (
            <button
              onClick={() => {
                setCarIdFilter('')
                setPage(1)
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              차량 필터 해제
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        총 {totalCount}개의 문의
      </div>

      {/* Inquiries List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">문의가 없습니다</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  문의자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  차량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {inquiry.contact_name}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        {inquiry.contact_phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {inquiry.contact_phone}
                          </div>
                        )}
                        {inquiry.contact_email && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {inquiry.contact_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {inquiry.car && (
                      <Link
                        href={`/admin/used-cars/cars/${Array.isArray(inquiry.car) ? inquiry.car[0]?.id : inquiry.car?.id}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Car className="w-4 h-4 mr-1" />
                        <span className="truncate max-w-xs">
                          {Array.isArray(inquiry.car) ? inquiry.car[0]?.title : inquiry.car?.title}
                        </span>
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {getTypeLabel(inquiry.inquiry_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(inquiry.status)}`}>
                      {getStatusLabel(inquiry.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(inquiry.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/used-cars/inquiries/${inquiry.id}`}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded inline-flex"
                      title="상세보기"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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