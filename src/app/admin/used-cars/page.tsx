'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Car,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
} from 'lucide-react'

interface DashboardStats {
  totalCars: number
  forSaleCars: number
  soldCars: number
  reservedCars: number
  draftCars: number
  totalRequests: number
  newRequests: number
  totalInquiries: number
  newInquiries: number
  inProgressInquiries: number
}

interface RecentCar {
  id: string
  title: string
  price: number
  status: string
  created_at: string
}

interface RecentRequest {
  id: string
  contact_name: string
  preferred_make: string | null
  preferred_model: string | null
  status: string
  created_at: string
}

interface RecentInquiry {
  id: string
  contact_name: string
  inquiry_type: string
  status: string
  created_at: string
  car: { title: string } | { title: string }[] | null
}

export default function UsedCarsDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    forSaleCars: 0,
    soldCars: 0,
    reservedCars: 0,
    draftCars: 0,
    totalRequests: 0,
    newRequests: 0,
    totalInquiries: 0,
    newInquiries: 0,
    inProgressInquiries: 0,
  })
  const [recentCars, setRecentCars] = useState<RecentCar[]>([])
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load car stats
      const { count: totalCars } = await supabase
        .from('used_cars')
        .select('*', { count: 'exact', head: true })

      const { count: forSaleCars } = await supabase
        .from('used_cars')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'FOR_SALE')

      const { count: soldCars } = await supabase
        .from('used_cars')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SOLD')

      const { count: reservedCars } = await supabase
        .from('used_cars')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'RESERVED')

      const { count: draftCars } = await supabase
        .from('used_cars')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'DRAFT')

      // Load request stats
      const { count: totalRequests } = await supabase
        .from('car_requests')
        .select('*', { count: 'exact', head: true })

      const { count: newRequests } = await supabase
        .from('car_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'NEW')

      // Load inquiry stats
      const { count: totalInquiries } = await supabase
        .from('car_inquiries')
        .select('*', { count: 'exact', head: true })

      const { count: newInquiries } = await supabase
        .from('car_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'NEW')

      const { count: inProgressInquiries } = await supabase
        .from('car_inquiries')
        .select('*', { count: 'exact', head: true })
        .in('status', ['CONTACTED', 'IN_PROGRESS'])

      setStats({
        totalCars: totalCars || 0,
        forSaleCars: forSaleCars || 0,
        soldCars: soldCars || 0,
        reservedCars: reservedCars || 0,
        draftCars: draftCars || 0,
        totalRequests: totalRequests || 0,
        newRequests: newRequests || 0,
        totalInquiries: totalInquiries || 0,
        newInquiries: newInquiries || 0,
        inProgressInquiries: inProgressInquiries || 0,
      })

      // Load recent cars
      const { data: cars } = await supabase
        .from('used_cars')
        .select('id, title, price, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentCars(cars || [])

      // Load recent requests
      const { data: requests } = await supabase
        .from('car_requests')
        .select('id, contact_name, preferred_make, preferred_model, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentRequests(requests || [])

      // Load recent inquiries
      const { data: inquiries } = await supabase
        .from('car_inquiries')
        .select(`
          id, contact_name, inquiry_type, status, created_at,
          car:used_cars(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentInquiries(inquiries || [])
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
      FOR_SALE: 'bg-green-100 text-green-800',
      SOLD: 'bg-gray-100 text-gray-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      DRAFT: 'bg-blue-100 text-blue-800',
      HIDDEN: 'bg-red-100 text-red-800',
      NEW: 'bg-red-100 text-red-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      SPAM: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      FOR_SALE: '판매중',
      SOLD: '판매완료',
      RESERVED: '예약중',
      DRAFT: '임시저장',
      HIDDEN: '숨김',
      NEW: '신규',
      CONTACTED: '연락완료',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      CLOSED: '종료',
      CANCELLED: '취소',
      SPAM: '스팸',
    }
    return labels[status] || status
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
        <h1 className="text-2xl font-bold text-gray-900">중고차 대시보드</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          새로고침
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cars Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">전체 차량</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCars}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">{stats.forSaleCars} 판매중</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-yellow-600">{stats.reservedCars} 예약</span>
          </div>
        </div>

        {/* Requests Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">차량 요청</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600">{stats.newRequests} 신규</span>
          </div>
        </div>

        {/* Inquiries Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">문의</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalInquiries}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600">{stats.newInquiries} 신규</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-blue-600">{stats.inProgressInquiries} 진행중</span>
          </div>
        </div>

        {/* Sales Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">판매완료</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.soldCars}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600">{stats.draftCars} 임시저장</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/used-cars/requests?status=NEW"
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-800">신규 요청</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-purple-900">{stats.newRequests}</p>
        </Link>

        <Link
          href="/admin/used-cars/inquiries?status=NEW"
          className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">신규 문의</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-900">{stats.newInquiries}</p>
        </Link>

        <Link
          href="/admin/used-cars/cars?status=FOR_SALE"
          className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">판매중 차량</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-900">{stats.forSaleCars}</p>
        </Link>

        <Link
          href="/admin/used-cars/cars/new"
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <Plus className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">차량 등록</span>
          </div>
          <p className="mt-1 text-sm text-blue-700">새 차량 등록하기</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cars */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">최근 등록 차량</h2>
            <Link href="/admin/used-cars/cars" className="text-sm text-blue-600 hover:text-blue-800">
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCars.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                등록된 차량이 없습니다
              </div>
            ) : (
              recentCars.map((car) => (
                <div key={car.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/used-cars/cars/${car.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {car.title}
                      </Link>
                      <p className="text-sm text-gray-500">{formatPrice(car.price)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(car.status)}`}>
                      {getStatusLabel(car.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(car.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">최근 차량 요청</h2>
            <Link href="/admin/used-cars/requests" className="text-sm text-blue-600 hover:text-blue-800">
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRequests.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                요청 내역이 없습니다
              </div>
            ) : (
              recentRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/used-cars/requests/${request.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {request.contact_name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {request.preferred_make || '제조사 미지정'}
                        {request.preferred_model && ` ${request.preferred_model}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(request.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">최근 문의</h2>
            <Link href="/admin/used-cars/inquiries" className="text-sm text-blue-600 hover:text-blue-800">
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentInquiries.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                문의 내역이 없습니다
              </div>
            ) : (
              recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/used-cars/inquiries/${inquiry.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {inquiry.contact_name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {Array.isArray(inquiry.car) ? inquiry.car[0]?.title : inquiry.car?.title || '차량 정보 없음'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(inquiry.status)}`}>
                      {getStatusLabel(inquiry.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(inquiry.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}