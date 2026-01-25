'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react'

type JoinedData<T> = T | T[] | null

interface MarketplaceItem {
  id: string
  title: string
  description: string
  price: number
  is_negotiable: boolean
  status: string
  condition: string
  category: string
  location: string | null
  view_count: number
  chat_count: number
  favorite_count: number
  created_at: string
  seller: JoinedData<{ id: string; full_name: string | null; email: string }>
  images: { id: string; image_url: string; display_order: number }[]
}

// Helper to extract single item from Supabase join result
function getJoinedItem<T>(data: JoinedData<T>): T | null {
  if (!data) return null
  if (Array.isArray(data)) return data[0] || null
  return data
}

const ITEMS_PER_PAGE = 20

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'sold', label: '판매완료' },
  { value: 'reserved', label: '예약중' },
  { value: 'hidden', label: '숨김' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: '전체 카테고리' },
  { value: 'electronics', label: '전자기기' },
  { value: 'furniture', label: '가구' },
  { value: 'clothing', label: '의류' },
  { value: 'home_appliances', label: '가전' },
  { value: 'sports', label: '스포츠' },
  { value: 'books', label: '도서' },
  { value: 'toys', label: '장난감' },
  { value: 'beauty', label: '뷰티' },
  { value: 'pets', label: '반려동물' },
  { value: 'vehicles', label: '차량' },
  { value: 'other', label: '기타' },
]

const CONDITION_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'new', label: '새상품' },
  { value: 'like_new', label: '거의 새것' },
  { value: 'good', label: '좋음' },
  { value: 'fair', label: '보통' },
  { value: 'poor', label: '나쁨' },
]

export default function MarketplaceItemsPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('marketplace_items')
        .select(`
          id, title, description, price, is_negotiable, status,
          condition, category, location, view_count, chat_count, favorite_count, created_at,
          seller:users(id, full_name, email),
          images:marketplace_item_images(id, image_url, display_order)
        `, { count: 'exact' })

      // Apply filters
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }
      if (conditionFilter) {
        query = query.eq('condition', conditionFilter)
      }
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, error: queryError, count } = await query

      if (queryError) {
        throw queryError
      }

      setItems((data || []) as MarketplaceItem[])
      setTotalCount(count || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '아이템을 불러오는 중 오류가 발생했습니다.'
      console.error('Error loading items:', err)
      setError(errorMessage)
      setItems([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, categoryFilter, conditionFilter, searchQuery])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadItems()
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((item) => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return

    try {
      let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

      switch (action) {
        case 'activate':
          updateData = { ...updateData, status: 'active' }
          break
        case 'hide':
          updateData = { ...updateData, status: 'hidden' }
          break
        default:
          return
      }

      const { error } = await supabase
        .from('marketplace_items')
        .update(updateData)
        .in('id', selectedItems)

      if (error) throw error

      setSelectedItems([])
      loadItems()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert('작업 중 오류가 발생했습니다.')
    }
  }

  const handleItemAction = async (itemId: string, action: string) => {
    try {
      let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

      switch (action) {
        case 'activate':
          updateData = { ...updateData, status: 'active' }
          break
        case 'hide':
          updateData = { ...updateData, status: 'hidden' }
          break
        case 'sold':
          updateData = { ...updateData, status: 'sold' }
          break
        default:
          return
      }

      const { error } = await supabase
        .from('marketplace_items')
        .update(updateData)
        .eq('id', itemId)

      if (error) throw error

      setActionMenuOpen(null)
      loadItems()
    } catch (error) {
      console.error('Error performing action:', error)
      alert('작업 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      reserved: 'bg-purple-100 text-purple-800',
      hidden: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '활성',
      sold: '판매완료',
      reserved: '예약중',
      hidden: '숨김',
    }
    return labels[status] || status
  }

  const getCategoryLabel = (category: string) => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category)
    return option?.label || category
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: '새상품',
      like_new: '거의 새것',
      good: '좋음',
      fair: '보통',
      poor: '나쁨',
    }
    return labels[condition] || condition
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (loading && items.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">아이템 관리</h1>
        <div className="text-sm text-gray-600">
          총 {totalCount}개
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="제목, 설명 검색..."
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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              검색
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedItems.length}개 선택됨
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              활성화
            </button>
            <button
              onClick={() => handleBulkAction('hide')}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              숨김
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={loadItems}
            className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                이미지
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                제목
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                판매자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                가격
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                카테고리
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
            {items.length === 0 && !error ? (
              <tr>
                <td colSpan={9} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">아이템이 없습니다</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {searchQuery || statusFilter || categoryFilter || conditionFilter
                        ? '검색 조건에 맞는 아이템이 없습니다. 필터를 변경해 보세요.'
                        : '아직 등록된 마켓플레이스 아이템이 없습니다.'}
                    </p>
                    <button
                      onClick={loadItems}
                      className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      새로고침
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images.sort((a, b) => a.display_order - b.display_order)[0].image_url}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/marketplace/items/${item.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {item.title.length > 30 ? `${item.title.slice(0, 30)}...` : item.title}
                    </Link>
                    <p className="text-xs text-gray-500">{getConditionLabel(item.condition)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{getJoinedItem(item.seller)?.full_name || '-'}</div>
                    <div className="text-xs text-gray-500">{getJoinedItem(item.seller)?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatPrice(item.price)}
                    {item.is_negotiable && <span className="text-xs text-gray-500 ml-1">(협상가능)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {getCategoryLabel(item.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {actionMenuOpen === item.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <Link
                            href={`/admin/marketplace/items/${item.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" /> 상세 보기
                          </Link>
                          {item.status === 'active' ? (
                            <button
                              onClick={() => handleItemAction(item.id, 'hide')}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <EyeOff className="w-4 h-4 mr-2" /> 숨김
                            </button>
                          ) : item.status === 'hidden' && (
                            <button
                              onClick={() => handleItemAction(item.id, 'activate')}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" /> 활성화
                            </button>
                          )}
                          {item.status !== 'sold' && (
                            <button
                              onClick={() => handleItemAction(item.id, 'sold')}
                              className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" /> 판매완료 처리
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
              {totalCount}개 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} 표시
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