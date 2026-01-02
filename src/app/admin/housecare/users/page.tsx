'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Pagination from '@/components/Pagination'

type PropertyHousecareUser = {
  id: string
  property_id: string
  user_id: string
  notes: string | null
  created_at: string
  updated_at: string
  properties: {
    id: string
    title: string
    road_address: string
  } | null
  users: {
    id: string
    full_name: string | null
    email: string
    phone_number: string | null
  } | null
}

type Property = {
  id: string
  title: string
  road_address: string
}

type User = {
  id: string
  full_name: string | null
  email: string
  phone_number: string | null
}

export default function HousecareUsersPage() {
  const [assignments, setAssignments] = useState<PropertyHousecareUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [propertySearch, setPropertySearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const itemsPerPage = 10

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAssignments()
  }, [currentPage, searchQuery])

  useEffect(() => {
    fetchPropertiesAndUsers()
  }, [])

  const fetchPropertiesAndUsers = async () => {
    const [propertiesRes, usersRes] = await Promise.all([
      supabase.from('properties').select('id, title, road_address').order('title'),
      supabase.from('users').select('id, full_name, email, phone_number').order('full_name')
    ])

    if (propertiesRes.data) setProperties(propertiesRes.data)
    if (usersRes.data) setUsers(usersRes.data)
  }

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('property_housecare_users')
        .select(`
          *,
          properties:property_id(id, title, road_address),
          users:user_id(id, full_name, email, phone_number)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.warn('Error fetching assignments:', error.message)
        setAssignments([])
        setTotalCount(0)
        return
      }

      // Filter by search query on client side (for property title or user name)
      let filteredData = data || []
      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase()
        filteredData = filteredData.filter(item =>
          item.properties?.title?.toLowerCase().includes(lowerSearch) ||
          item.properties?.road_address?.toLowerCase().includes(lowerSearch) ||
          item.users?.full_name?.toLowerCase().includes(lowerSearch) ||
          item.users?.email?.toLowerCase().includes(lowerSearch)
        )
      }

      setAssignments(filteredData)
      setTotalCount(count || 0)
    } catch (error) {
      console.warn('Unexpected error in fetchAssignments:', error)
      setAssignments([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssignment = async () => {
    if (!selectedPropertyId || !selectedUserId) {
      alert('매물과 사용자를 모두 선택해주세요')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('property_housecare_users')
        .insert({
          property_id: selectedPropertyId,
          user_id: selectedUserId,
          notes: notes || null
        })

      if (error) {
        if (error.code === '23505') {
          alert('이미 해당 매물에 연결된 사용자입니다')
        } else {
          console.error('Error adding assignment:', error)
          alert(`추가에 실패했습니다: ${error.message || error.code || JSON.stringify(error)}`)
        }
        return
      }

      await fetchAssignments()
      setShowAddModal(false)
      setSelectedPropertyId('')
      setSelectedUserId('')
      setNotes('')
      setPropertySearch('')
      setUserSearch('')
    } catch (error) {
      console.warn('Unexpected error in handleAddAssignment:', error)
      alert('추가 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 연결을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('property_housecare_users')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting assignment:', error.message)
        alert('삭제에 실패했습니다')
        return
      }

      await fetchAssignments()
    } catch (error) {
      console.warn('Unexpected error in handleDelete:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchAssignments()
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

  // Filter properties and users for dropdown search
  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
    p.road_address.toLowerCase().includes(propertySearch.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    (u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || false) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">하우스케어 사용자 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 사용자 연결
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="매물명, 주소, 사용자 이름 또는 이메일로 검색..."
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
                fetchAssignments()
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">로딩 중...</div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">연결된 하우스케어 사용자가 없습니다</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            첫 사용자 연결하기
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      매물
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      메모
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연결일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.properties ? (
                          <div>
                            <div className="font-medium">{assignment.properties.title}</div>
                            <div className="text-xs text-gray-500">{assignment.properties.road_address}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.users ? (
                          <div>
                            <div className="font-medium">{assignment.users.full_name || '-'}</div>
                            <div className="text-xs text-gray-500">{assignment.users.email}</div>
                            {assignment.users.phone_number && (
                              <div className="text-xs text-gray-500">{assignment.users.phone_number}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {assignment.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(assignment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(assignment.id)}
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

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">하우스케어 사용자 연결</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedPropertyId('')
                    setSelectedUserId('')
                    setNotes('')
                    setPropertySearch('')
                    setUserSearch('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Property Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    매물 선택 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="매물 검색..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size={5}
                  >
                    <option value="">선택해주세요</option>
                    {filteredProperties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} ({property.road_address})
                      </option>
                    ))}
                  </select>
                  {selectedPropertyId && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      선택됨: {properties.find(p => p.id === selectedPropertyId)?.title}
                    </div>
                  )}
                </div>

                {/* User Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자 선택 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="사용자 검색..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size={5}
                  >
                    <option value="">선택해주세요</option>
                    {filteredUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || '(이름없음)'} - {user.email}
                      </option>
                    ))}
                  </select>
                  {selectedUserId && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      선택됨: {users.find(u => u.id === selectedUserId)?.full_name || users.find(u => u.id === selectedUserId)?.email}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메모 (선택)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="메모를 입력하세요..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedPropertyId('')
                    setSelectedUserId('')
                    setNotes('')
                    setPropertySearch('')
                    setUserSearch('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleAddAssignment}
                  disabled={saving || !selectedPropertyId || !selectedUserId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? '저장중...' : '연결'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
