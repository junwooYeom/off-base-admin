'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Pagination from '@/components/Pagination'

type HousecareStatus = 'PENDING' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

type HousecareRequest = {
  id: string
  user_id: string
  property_id: string | null
  realtor_company_id: string | null
  title: string
  description: string | null
  status: HousecareStatus
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  users: {
    full_name: string | null
    email: string
    phone_number: string | null
  } | null
  properties: {
    title: string
    road_address: string
  } | null
  realtor_companies: {
    company_name: string
  } | null
  housecare_request_photos: {
    id: string
    photo_url: string
    display_order: number
  }[]
}

type Property = {
  id: string
  title: string
  road_address: string
}

type RealtorCompany = {
  id: string
  company_name: string
}

const STATUS_LABELS: Record<HousecareStatus, string> = {
  PENDING: '대기중',
  IN_REVIEW: '검토중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨'
}

const STATUS_COLORS: Record<HousecareStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

export default function HousecarePage() {
  const [requests, setRequests] = useState<HousecareRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<HousecareStatus | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<HousecareRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [companies, setCompanies] = useState<RealtorCompany[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const itemsPerPage = 10

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchRequests()
  }, [currentPage, searchQuery, statusFilter])

  useEffect(() => {
    fetchPropertiesAndCompanies()
  }, [])

  const fetchPropertiesAndCompanies = async () => {
    const [propertiesRes, companiesRes] = await Promise.all([
      supabase.from('properties').select('id, title, road_address').order('title'),
      supabase.from('realtor_companies').select('id, company_name').order('company_name')
    ])

    if (propertiesRes.data) setProperties(propertiesRes.data)
    if (companiesRes.data) setCompanies(companiesRes.data)
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('housecare_requests')
        .select(`
          *,
          users:user_id(full_name, email, phone_number),
          properties:property_id(title, road_address),
          realtor_companies:realtor_company_id(company_name),
          housecare_request_photos(id, photo_url, display_order)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.warn('Error fetching housecare requests:', error.message)
        setRequests([])
        setTotalCount(0)
        return
      }

      setRequests(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.warn('Unexpected error in fetchRequests:', error)
      setRequests([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: HousecareStatus) => {
    setUpdating(true)
    try {
      const updateData: Record<string, string | null> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      if (newStatus !== 'PENDING') {
        updateData.reviewed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('housecare_requests')
        .update(updateData)
        .eq('id', requestId)

      if (error) {
        console.warn('Error updating status:', error.message)
        alert('상태 변경에 실패했습니다')
        return
      }

      await fetchRequests()
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.warn('Unexpected error in handleStatusChange:', error)
      alert('상태 변경 중 오류가 발생했습니다')
    } finally {
      setUpdating(false)
    }
  }

  const handleLinkPropertyAndCompany = async () => {
    if (!selectedRequest) return

    setUpdating(true)
    try {
      const updateData: Record<string, string | null> = {
        property_id: selectedPropertyId || null,
        realtor_company_id: selectedCompanyId || null,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('housecare_requests')
        .update(updateData)
        .eq('id', selectedRequest.id)

      if (error) {
        console.warn('Error linking property/company:', error.message)
        alert('연결에 실패했습니다')
        return
      }

      await fetchRequests()
      setShowLinkModal(false)
      setSelectedRequest(null)
      setSelectedPropertyId('')
      setSelectedCompanyId('')
      setAdminNotes('')
    } catch (error) {
      console.warn('Unexpected error in handleLinkPropertyAndCompany:', error)
      alert('연결 중 오류가 발생했습니다')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 하우스케어 요청을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('housecare_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting housecare request:', error.message)
        alert('삭제에 실패했습니다')
        return
      }

      await fetchRequests()
    } catch (error) {
      console.warn('Unexpected error in handleDelete:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  const openDetailModal = (request: HousecareRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const openLinkModal = (request: HousecareRequest) => {
    setSelectedRequest(request)
    setSelectedPropertyId(request.property_id || '')
    setSelectedCompanyId(request.realtor_company_id || '')
    setAdminNotes(request.admin_notes || '')
    setShowLinkModal(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">하우스케어 요청 관리</h1>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="제목 또는 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              검색
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                초기화
              </button>
            )}
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as HousecareStatus | 'ALL')
            setCurrentPage(1)
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">로딩 중...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">하우스케어 요청이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연결된 매물
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연결된 회사
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사진
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="text-blue-600 hover:underline text-left"
                        >
                          {request.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{request.users?.full_name || '-'}</div>
                          <div className="text-xs text-gray-500">{request.users?.email}</div>
                          {request.users?.phone_number && (
                            <div className="text-xs text-gray-500">{request.users.phone_number}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.properties ? (
                          <div>
                            <div className="font-medium">{request.properties.title}</div>
                            <div className="text-xs text-gray-500">{request.properties.road_address}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.realtor_companies?.company_name || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.housecare_request_photos?.length > 0 ? (
                          <span className="text-blue-600">
                            {request.housecare_request_photos.length}장
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request.id, e.target.value as HousecareStatus)}
                          disabled={updating}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[request.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openLinkModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          연결
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedRequest.title}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">요청자</h3>
                  <p className="mt-1">
                    {selectedRequest.users?.full_name || '-'} ({selectedRequest.users?.email})
                    {selectedRequest.users?.phone_number && (
                      <span className="ml-2 text-gray-500">{selectedRequest.users.phone_number}</span>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">상태</h3>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${STATUS_COLORS[selectedRequest.status]}`}>
                    {STATUS_LABELS[selectedRequest.status]}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">설명</h3>
                  <p className="mt-1 whitespace-pre-wrap">{selectedRequest.description || '-'}</p>
                </div>

                {selectedRequest.properties && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">연결된 매물</h3>
                    <p className="mt-1">
                      {selectedRequest.properties.title}
                      <span className="text-gray-500 ml-2">({selectedRequest.properties.road_address})</span>
                    </p>
                  </div>
                )}

                {selectedRequest.realtor_companies && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">연결된 중개회사</h3>
                    <p className="mt-1">{selectedRequest.realtor_companies.company_name}</p>
                  </div>
                )}

                {selectedRequest.admin_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">관리자 메모</h3>
                    <p className="mt-1 whitespace-pre-wrap">{selectedRequest.admin_notes}</p>
                  </div>
                )}

                {selectedRequest.housecare_request_photos?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">첨부 사진</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedRequest.housecare_request_photos
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((photo) => (
                          <a
                            key={photo.id}
                            href={photo.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={photo.photo_url}
                              alt="Request photo"
                              className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">요청일:</span> {formatDate(selectedRequest.created_at)}
                  </div>
                  {selectedRequest.reviewed_at && (
                    <div>
                      <span className="font-medium">검토일:</span> {formatDate(selectedRequest.reviewed_at)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Property/Company Modal */}
      {showLinkModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">매물/회사 연결</h2>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    요청: {selectedRequest.title}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    매물 연결
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} ({property.road_address})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    중개회사 연결
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    관리자 메모
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="관리자 메모를 입력하세요..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleLinkPropertyAndCompany}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? '저장중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}