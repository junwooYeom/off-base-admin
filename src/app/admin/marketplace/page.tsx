'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  MessageSquare,
  Heart,
} from 'lucide-react'

interface DashboardStats {
  totalItems: number
  activeItems: number
  reservedItems: number
  soldItems: number
  totalTransactions: number
  completedTransactions: number
  openReports: number
  totalChats: number
  totalFavorites: number
}

type JoinedData<T> = T | T[] | null

interface RecentItem {
  id: string
  title: string
  price: number
  status: string
  category: string
  created_at: string
  seller: JoinedData<{ full_name: string | null; email: string }>
}

interface RecentReport {
  id: string
  reason: string
  description: string | null
  is_reviewed: boolean
  created_at: string
  item: JoinedData<{ id: string; title: string }>
  reporter: JoinedData<{ full_name: string | null; email: string }>
}

export default function MarketplaceDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    activeItems: 0,
    reservedItems: 0,
    soldItems: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    openReports: 0,
    totalChats: 0,
    totalFavorites: 0,
  })
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load items stats
      const { count: totalItems } = await supabase
        .from('marketplace_items')
        .select('*', { count: 'exact', head: true })

      const { count: activeItems } = await supabase
        .from('marketplace_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: reservedItems } = await supabase
        .from('marketplace_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'reserved')

      const { count: soldItems } = await supabase
        .from('marketplace_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sold')

      // Load transaction stats
      const { count: totalTransactions } = await supabase
        .from('marketplace_transactions')
        .select('*', { count: 'exact', head: true })

      const { count: completedTransactions } = await supabase
        .from('marketplace_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Load report stats (unreviewed reports)
      const { count: openReports } = await supabase
        .from('marketplace_item_reports')
        .select('*', { count: 'exact', head: true })
        .eq('is_reviewed', false)

      // Load chat rooms count
      const { count: totalChats } = await supabase
        .from('marketplace_chat_rooms')
        .select('*', { count: 'exact', head: true })

      // Load favorites count
      const { count: totalFavorites } = await supabase
        .from('marketplace_item_favorites')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalItems: totalItems || 0,
        activeItems: activeItems || 0,
        reservedItems: reservedItems || 0,
        soldItems: soldItems || 0,
        totalTransactions: totalTransactions || 0,
        completedTransactions: completedTransactions || 0,
        openReports: openReports || 0,
        totalChats: totalChats || 0,
        totalFavorites: totalFavorites || 0,
      })

      // Load recent items
      const { data: items } = await supabase
        .from('marketplace_items')
        .select(`
          id, title, price, status, category, created_at,
          seller:users(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentItems((items as RecentItem[]) || [])

      // Load recent reports
      const { data: reports } = await supabase
        .from('marketplace_item_reports')
        .select(`
          id, reason, description, is_reviewed, created_at,
          item:marketplace_items(id, title),
          reporter:users(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentReports((reports as RecentReport[]) || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      hidden: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '판매중',
      reserved: '예약중',
      sold: '판매완료',
      hidden: '숨김',
    }
    return labels[status] || status
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      electronics: '전자제품',
      furniture: '가구',
      clothing: '의류',
      home_appliances: '가전',
      sports: '스포츠',
      books: '도서',
      toys: '완구',
      beauty: '뷰티',
      pets: '반려동물',
      vehicles: '차량',
      other: '기타',
    }
    return labels[category] || category
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      prohibited_item: '금지 품목',
      fraud: '사기',
      inappropriate: '부적절한 내용',
      wrong_category: '잘못된 카테고리',
      duplicate: '중복 게시',
      other: '기타',
    }
    return labels[reason] || reason
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">마켓플레이스 대시보드</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          새로고침
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Items Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 아이템</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">{stats.activeItems} 활성</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-yellow-600">{stats.reservedItems} 예약</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-600">{stats.soldItems} 판매완료</span>
          </div>
        </div>

        {/* Transactions Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">거래</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">{stats.completedTransactions} 완료</span>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">채팅방</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalChats}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Heart className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-gray-600">{stats.totalFavorites} 찜</span>
          </div>
        </div>

        {/* Reports Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">미처리 신고</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.openReports}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/marketplace/reports"
              className="text-sm text-red-600 hover:text-red-800"
            >
              신고 관리 →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/marketplace/items?status=active"
          className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">판매중 아이템</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-900">{stats.activeItems}</p>
        </Link>

        <Link
          href="/admin/marketplace/reports"
          className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">미처리 신고</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-900">{stats.openReports}</p>
        </Link>

        <Link
          href="/admin/marketplace/items"
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <ShoppingBag className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">전체 아이템 관리</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-900">{stats.totalItems}</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">최근 등록 아이템</h2>
            <Link href="/admin/marketplace/items" className="text-sm text-blue-600 hover:text-blue-800">
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                등록된 아이템이 없습니다
              </div>
            ) : (
              recentItems.map((item) => {
                const seller = Array.isArray(item.seller) ? item.seller[0] : item.seller
                return (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/admin/marketplace/items/${item.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {seller?.full_name || seller?.email || 'Unknown'} · {formatPrice(item.price)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getCategoryLabel(item.category)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(item.created_at)}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">최근 신고</h2>
            <Link href="/admin/marketplace/reports" className="text-sm text-blue-600 hover:text-blue-800">
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentReports.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                신고 내역이 없습니다
              </div>
            ) : (
              recentReports.map((report) => {
                const item = Array.isArray(report.item) ? report.item[0] : report.item
                const reporter = Array.isArray(report.reporter) ? report.reporter[0] : report.reporter
                return (
                  <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {getReasonLabel(report.reason)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {item?.title || '삭제된 아이템'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          신고자: {reporter?.full_name || reporter?.email || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.is_reviewed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {report.is_reviewed ? '처리완료' : '미처리'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(report.created_at)}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}