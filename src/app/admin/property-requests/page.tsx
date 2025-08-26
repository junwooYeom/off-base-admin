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
        console.error('Error fetching property requests:', error)
        return
      }

      setPropertyRequests(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property request?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('property_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting property request:', error)
        alert('Failed to delete property request')
        return
      }

      fetchPropertyRequests()
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while deleting the property request')
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
      <h1 className="text-3xl font-bold mb-8">Property Requests</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by address or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
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
              Clear
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : propertyRequests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">No property requests found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address Detail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                          Delete
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
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}