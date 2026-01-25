'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Shield,
  Star,
} from 'lucide-react'

interface MarketplaceUser {
  user_id: string
  marketplace_status: string
  seller_rating: number | null
  buyer_rating: number | null
  total_sales: number
  total_purchases: number
  completed_transactions: number
  cancelled_transactions: number
  is_verified_seller: boolean
  warning_count: number
  risk_score: number
  can_sell: boolean
  can_buy: boolean
  created_at: string
  user: { id: string; name: string; email: string; phone: string } | null
}

const ITEMS_PER_PAGE = 20

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'RESTRICTED', label: '제한' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'BANNED', label: '차단' },
]

export default function MarketplaceUsersPage() {
  const [users, setUsers] = useState<MarketplaceUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('marketplace_user_profiles')
        .select(`
          *,
          user:users(id, name, email, phone)
        `, { count: 'exact' })

      // Apply filters
      if (statusFilter) {
        query = query.eq('marketplace_status', statusFilter)
      }
      if (verifiedFilter === 'true') {
        query = query.eq('is_verified_seller', true)
      } else if (verifiedFilter === 'false') {
        query = query.eq('is_verified_seller', false)
      }

      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      // Filter by search (in memory due to join)
      let filteredData = data as MarketplaceUser[]
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        filteredData = filteredData.filter((profile) =>
          profile.user?.name?.toLowerCase().includes(searchLower) ||
          profile.user?.email?.toLowerCase().includes(searchLower)
        )
      }

      setUsers(filteredData)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, verifiedFilter, searchQuery])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

      switch (action) {
        case 'verify':
          updateData = { ...updateData, is_verified_seller: true, verified_at: new Date().toISOString() }
          break
        case 'unverify':
          updateData = { ...updateData, is_verified_seller: false, verified_at: null }
          break
        case 'restrict':
          updateData = { ...updateData, marketplace_status: 'RESTRICTED', can_sell: false }
          break
        case 'suspend':
          updateData = {
            ...updateData,
            marketplace_status: 'SUSPENDED',
            can_sell: false,
            can_buy: false,
            suspended_at: new Date().toISOString(),
          }
          break
        case 'ban':
          updateData = {
            ...updateData,
            marketplace_status: 'BANNED',
            can_sell: false,
            can_buy: false,
            banned_at: new Date().toISOString(),
          }
          break
        case 'activate':
          updateData = {
            ...updateData,
            marketplace_status: 'ACTIVE',
            can_sell: true,
            can_buy: true,
            suspended_at: null,
            banned_at: null,
          }
          break
        default:
          return
      }

      const { error } = await supabase
        .from('marketplace_user_profiles')
        .update(updateData)
        .eq('user_id', userId)

      if (error) throw error

      setActionMenuOpen(null)
      loadUsers()
    } catch (error) {
      console.error('Error performing action:', error)
      alert('작업 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      RESTRICTED: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      BANNED: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (loading && users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">마켓플레이스 사용자 관리</h1>
        <div className="text-sm text-gray-600">
          총 {totalCount}명
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름, 이메일 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Verified Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => {
              setVerifiedFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 인증</option>
            <option value="true">인증됨</option>
            <option value="false">미인증</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            검색
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                사용자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                평점
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                거래
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                경고
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                위험도
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  사용자가 없습니다
                </td>
              </tr>
            ) : (
              users.map((profile) => (
                <tr key={profile.user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div>
                        <Link
                          href={`/admin/marketplace/users/${profile.user_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {profile.user?.name || 'Unknown'}
                        </Link>
                        <p className="text-sm text-gray-500">{profile.user?.email}</p>
                      </div>
                      {profile.is_verified_seller && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(profile.marketplace_status)}`}>
                      {profile.marketplace_status}
                    </span>
                    <div className="mt-1 text-xs text-gray-500">
                      {profile.can_sell && <span className="mr-2">판매가능</span>}
                      {profile.can_buy && <span>구매가능</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="font-medium">
                            {profile.seller_rating ? profile.seller_rating.toFixed(1) : '-'}
                          </span>
                          <span className="text-gray-500 ml-1">(판매)</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-blue-400 mr-1" />
                          <span className="font-medium">
                            {profile.buyer_rating ? profile.buyer_rating.toFixed(1) : '-'}
                          </span>
                          <span className="text-gray-500 ml-1">(구매)</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>판매: {profile.total_sales}</div>
                    <div>구매: {profile.total_purchases}</div>
                    <div className="text-gray-500">완료: {profile.completed_transactions}</div>
                  </td>
                  <td className="px-4 py-3">
                    {profile.warning_count > 0 ? (
                      <span className="flex items-center text-yellow-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {profile.warning_count}회
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {profile.risk_score > 0 ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profile.risk_score >= 70 ? 'bg-red-100 text-red-800' :
                        profile.risk_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {profile.risk_score}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === profile.user_id ? null : profile.user_id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {actionMenuOpen === profile.user_id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <Link
                            href={`/admin/marketplace/users/${profile.user_id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            상세 보기
                          </Link>
                          {!profile.is_verified_seller ? (
                            <button
                              onClick={() => handleUserAction(profile.user_id, 'verify')}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <Shield className="w-4 h-4 mr-2" /> 판매자 인증
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(profile.user_id, 'unverify')}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <XCircle className="w-4 h-4 mr-2" /> 인증 취소
                            </button>
                          )}
                          {profile.marketplace_status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleUserAction(profile.user_id, 'activate')}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" /> 활성화
                            </button>
                          )}
                          {profile.marketplace_status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => handleUserAction(profile.user_id, 'restrict')}
                                className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" /> 제한
                              </button>
                              <button
                                onClick={() => handleUserAction(profile.user_id, 'suspend')}
                                className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> 정지
                              </button>
                            </>
                          )}
                          {profile.marketplace_status !== 'BANNED' && (
                            <button
                              onClick={() => handleUserAction(profile.user_id, 'ban')}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <Ban className="w-4 h-4 mr-2" /> 차단
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {totalCount}명 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} 표시
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-3 py-1 text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}