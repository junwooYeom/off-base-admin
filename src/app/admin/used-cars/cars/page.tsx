'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Car,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gauge,
} from 'lucide-react'

interface UsedCar {
  id: string
  title: string
  make: string
  model: string
  year: number
  mileage: number
  price: number
  status: string
  location_type: string
  created_at: string
  images?: { image_url: string }[]
}

interface CarMake {
  id: string
  name: string
  name_ko: string | null
}

function CarsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cars, setCars] = useState<UsedCar[]>([])
  const [makes, setMakes] = useState<CarMake[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [makeFilter, setMakeFilter] = useState(searchParams.get('make') || '')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const pageSize = 20

  const loadMakes = useCallback(async () => {
    const { data } = await supabase
      .from('car_makes')
      .select('id, name, name_ko')
      .eq('is_active', true)
      .order('display_order')
    setMakes(data || [])
  }, [])

  const loadCars = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('used_cars')
        .select(`
          id, title, make, model, year, mileage, price, status, location_type, created_at,
          images:car_images(image_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      if (makeFilter) {
        query = query.eq('make', makeFilter)
      }

      if (locationFilter) {
        query = query.eq('location_type', locationFilter)
      }

      const { data, error, count } = await query

      if (error) throw error

      setCars(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading cars:', error)
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, statusFilter, makeFilter, locationFilter])

  useEffect(() => {
    loadMakes()
  }, [loadMakes])

  useEffect(() => {
    loadCars()
  }, [loadCars])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (statusFilter) params.set('status', statusFilter)
    if (makeFilter) params.set('make', makeFilter)
    if (locationFilter) params.set('location', locationFilter)
    if (page > 1) params.set('page', page.toString())
    router.push(`/admin/used-cars/cars?${params.toString()}`, { scroll: false })
  }, [searchTerm, statusFilter, makeFilter, locationFilter, page, router])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      FOR_SALE: 'bg-green-100 text-green-800',
      SOLD: 'bg-gray-100 text-gray-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      DRAFT: 'bg-blue-100 text-blue-800',
      HIDDEN: 'bg-red-100 text-red-800',
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
    }
    return labels[status] || status
  }

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      PYEONGTAEK: '평택',
      OSAN: '오산',
      DONGDUCHEON: '동두천',
      HUMPHREYS: '험프리스',
    }
    return labels[location] || location
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ko-KR').format(mileage) + ' km'
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">차량 관리</h1>
        <Link
          href="/admin/used-cars/cars/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> 차량 등록
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="차량명, 제조사, 모델 검색..."
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
            <option value="FOR_SALE">판매중</option>
            <option value="RESERVED">예약중</option>
            <option value="SOLD">판매완료</option>
            <option value="DRAFT">임시저장</option>
            <option value="HIDDEN">숨김</option>
          </select>
          <select
            value={makeFilter}
            onChange={(e) => {
              setMakeFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 제조사</option>
            {makes.map((make) => (
              <option key={make.id} value={make.name}>
                {make.name_ko || make.name}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 지역</option>
            <option value="PYEONGTAEK">평택</option>
            <option value="OSAN">오산</option>
            <option value="DONGDUCHEON">동두천</option>
            <option value="HUMPHREYS">험프리스</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        총 {totalCount}대의 차량
      </div>

      {/* Cars Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : cars.length === 0 ? (
          <div className="p-8 text-center text-gray-500">차량이 없습니다</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {cars.map((car) => (
              <div
                key={car.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative">
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[0].image_url}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(car.status)}`}>
                    {getStatusLabel(car.status)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">{car.title}</h3>
                  <p className="text-sm text-gray-500">
                    {car.make} {car.model}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {car.year}
                    </span>
                    <span className="flex items-center">
                      <Gauge className="w-3 h-3 mr-1" />
                      {formatMileage(car.mileage)}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(car.price)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {getLocationLabel(car.location_type)}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/admin/used-cars/cars/${car.id}`}
                      className="flex-1 flex items-center justify-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      보기
                    </Link>
                    <Link
                      href={`/admin/used-cars/cars/${car.id}?edit=true`}
                      className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      수정
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="bg-white shadow rounded-lg p-6"><div className="text-center">로딩 중...</div></div>}>
      <CarsPageContent />
    </Suspense>
  )
}