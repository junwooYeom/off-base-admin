'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/Pagination'

type PropertyRequest = {
  id: string
  address: string
  address_detail: string | null
  user_contact: string
  created_at: string
  updated_at: string
}

export default function PropertyRequestsPage() {
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPropertyRequests()
  }, [currentPage, searchQuery])

  const fetchPropertyRequests = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('property_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`address.ilike.%${searchQuery}%,user_contact.ilike.%${searchQuery}%`)
      }

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      
      const { data, error, count } = await query.range(from, to)

      if (error) {
        // Use console.warn instead of console.error to avoid Next.js error interception
        console.warn('Error fetching property requests:', error.message)
        // Only show alert for non-network errors
        if (error.code !== 'PGRST301' && error.code !== '42P01') {
          alert(`매물 요청을 불러오는 중 오류가 발생했습니다: ${error.message}`)
        }
        setPropertyRequests([])
        setTotalCount(0)
        return
      }

      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Property requests fetched:', { data, count })
      }
      
      setPropertyRequests(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      // Use console.warn instead of console.error
      console.warn('Unexpected error in fetchPropertyRequests:', error)
      setPropertyRequests([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 매물 요청을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('property_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting property request:', error.message)
        alert('매물 요청 삭제에 실패했습니다')
        return
      }

      // Refresh the list after successful deletion
      await fetchPropertyRequests()
    } catch (error) {
      console.warn('Unexpected error in handleDelete:', error)
      alert('매물 요청 삭제 중 오류가 발생했습니다')
    }
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
      <h1 className="text-3xl font-bold mb-8">매물 요청 관리</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="주소 또는 연락처로 검색..."
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">로딩 중...</div>
        </div>
      ) : propertyRequests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">매물 요청이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상세 주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
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
                  {propertyRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.address_detail || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a
                          href={`mailto:${request.user_contact}`}
                          className="text-blue-600 hover:underline"
                        >
                          {request.user_contact}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
    </div>
  )
}