'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Trash2,
  Car,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  MapPin,
  MessageSquare,
} from 'lucide-react'

interface UsedCar {
  id: string
  title: string
  make: string
  model: string
  trim: string | null
  year: number
  mileage: number
  fuel_type: string
  transmission: string
  body_type: string | null
  exterior_color: string | null
  interior_color: string | null
  engine_size: string | null
  horsepower: number | null
  drivetrain: string | null
  vin: string | null
  plate_number: string | null
  price: number
  original_price: number | null
  is_negotiable: boolean
  status: string
  location_type: string
  description: string | null
  accident_history: string | null
  service_history: string | null
  previous_owners: number | null
  warranty_remaining: string | null
  inspection_date: string | null
  registration_date: string | null
  admin_notes: string | null
  inquiry_count: number
  view_count: number
  created_at: string
  updated_at: string
}

interface CarImage {
  id: string
  image_url: string
  is_primary: boolean
  image_type: string
  display_order: number
}

interface CarOption {
  id: string
  name: string
  name_ko: string | null
  category: string
}

interface CarMake {
  id: string
  name: string
  name_ko: string | null
}

function CarDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  const carId = params.id as string

  const [car, setCar] = useState<UsedCar | null>(null)
  const [images, setImages] = useState<CarImage[]>([])
  const [options, setOptions] = useState<CarOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [allOptions, setAllOptions] = useState<CarOption[]>([])
  const [makes, setMakes] = useState<CarMake[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<UsedCar>>({})

  const loadCar = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('used_cars')
        .select('*')
        .eq('id', carId)
        .single()

      if (error) throw error

      setCar(data)
      setFormData(data)

      // Load images
      const { data: imagesData } = await supabase
        .from('car_images')
        .select('*')
        .eq('car_id', carId)
        .order('display_order')

      setImages(imagesData || [])

      // Load car options
      const { data: optionMappings } = await supabase
        .from('car_option_mappings')
        .select('option_id')
        .eq('car_id', carId)

      setSelectedOptions(optionMappings?.map(m => m.option_id) || [])
    } catch (error) {
      console.error('Error loading car:', error)
      alert('차량 정보를 불러오는데 실패했습니다.')
      router.push('/admin/used-cars/cars')
    } finally {
      setLoading(false)
    }
  }, [carId, router])

  const loadOptions = useCallback(async () => {
    const { data } = await supabase
      .from('car_options')
      .select('*')
      .eq('is_active', true)
      .order('category, display_order')

    setAllOptions(data || [])
    setOptions(data?.filter(o => selectedOptions.includes(o.id)) || [])
  }, [selectedOptions])

  const loadMakes = useCallback(async () => {
    const { data } = await supabase
      .from('car_makes')
      .select('id, name, name_ko')
      .eq('is_active', true)
      .order('display_order')
    setMakes(data || [])
  }, [])

  useEffect(() => {
    loadCar()
    loadMakes()
  }, [loadCar, loadMakes])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  const handleSave = async () => {
    if (!formData.title || !formData.make || !formData.model) {
      alert('필수 정보를 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('used_cars')
        .update({
          title: formData.title,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          year: formData.year,
          mileage: formData.mileage,
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          body_type: formData.body_type,
          exterior_color: formData.exterior_color,
          interior_color: formData.interior_color,
          engine_size: formData.engine_size,
          horsepower: formData.horsepower,
          drivetrain: formData.drivetrain,
          vin: formData.vin,
          plate_number: formData.plate_number,
          price: formData.price,
          original_price: formData.original_price,
          is_negotiable: formData.is_negotiable,
          status: formData.status,
          location_type: formData.location_type,
          description: formData.description,
          accident_history: formData.accident_history,
          service_history: formData.service_history,
          previous_owners: formData.previous_owners,
          warranty_remaining: formData.warranty_remaining,
          inspection_date: formData.inspection_date,
          registration_date: formData.registration_date,
          admin_notes: formData.admin_notes,
        })
        .eq('id', carId)

      if (error) throw error

      // Update options
      await supabase
        .from('car_option_mappings')
        .delete()
        .eq('car_id', carId)

      if (selectedOptions.length > 0) {
        await supabase
          .from('car_option_mappings')
          .insert(selectedOptions.map(optionId => ({
            car_id: carId,
            option_id: optionId,
          })))
      }

      alert('저장되었습니다.')
      router.push(`/admin/used-cars/cars/${carId}`)
      loadCar()
    } catch (error) {
      console.error('Error saving car:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('used_cars')
        .delete()
        .eq('id', carId)

      if (error) throw error

      alert('삭제되었습니다.')
      router.push('/admin/used-cars/cars')
    } catch (error) {
      console.error('Error deleting car:', error)
      alert('삭제에 실패했습니다.')
    }
  }

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

  const getFuelLabel = (fuel: string) => {
    const labels: Record<string, string> = {
      GASOLINE: '가솔린',
      DIESEL: '디젤',
      HYBRID: '하이브리드',
      ELECTRIC: '전기',
      LPG: 'LPG',
    }
    return labels[fuel] || fuel
  }

  const getTransmissionLabel = (trans: string) => {
    const labels: Record<string, string> = {
      AUTOMATIC: '자동',
      MANUAL: '수동',
      CVT: 'CVT',
      DCT: 'DCT',
    }
    return labels[trans] || trans
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const groupedOptions = allOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, CarOption[]>)

  const categoryLabels: Record<string, string> = {
    SAFETY: '안전',
    COMFORT: '편의',
    TECHNOLOGY: '기술',
    EXTERIOR: '외관',
    PERFORMANCE: '성능',
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">차량을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/used-cars/cars"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '차량 수정' : '차량 상세'}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Link
                href={`/admin/used-cars/cars/${carId}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </button>
              <Link
                href={`/admin/used-cars/cars/${carId}?edit=true`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                수정
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">이미지</h2>
            {images.length === 0 ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <Car className="w-16 h-16 text-gray-300" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${
                      image.is_primary ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {image.is_primary && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                        대표
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>

            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    차량명 *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제조사 *
                    </label>
                    <select
                      value={formData.make || ''}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">선택</option>
                      {makes.map((make) => (
                        <option key={make.id} value={make.name}>
                          {make.name_ko || make.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      모델 *
                    </label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      트림
                    </label>
                    <input
                      type="text"
                      value={formData.trim || ''}
                      onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연식 *
                    </label>
                    <input
                      type="number"
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      주행거리 *
                    </label>
                    <input
                      type="number"
                      value={formData.mileage || ''}
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="km"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연료
                    </label>
                    <select
                      value={formData.fuel_type || 'GASOLINE'}
                      onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GASOLINE">가솔린</option>
                      <option value="DIESEL">디젤</option>
                      <option value="HYBRID">하이브리드</option>
                      <option value="ELECTRIC">전기</option>
                      <option value="LPG">LPG</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      변속기
                    </label>
                    <select
                      value={formData.transmission || 'AUTOMATIC'}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AUTOMATIC">자동</option>
                      <option value="MANUAL">수동</option>
                      <option value="CVT">CVT</option>
                      <option value="DCT">DCT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      외장색
                    </label>
                    <input
                      type="text"
                      value={formData.exterior_color || ''}
                      onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      내장색
                    </label>
                    <input
                      type="text"
                      value={formData.interior_color || ''}
                      onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      지역
                    </label>
                    <select
                      value={formData.location_type || 'PYEONGTAEK'}
                      onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PYEONGTAEK">평택</option>
                      <option value="OSAN">오산</option>
                      <option value="DONGDUCHEON">동두천</option>
                      <option value="HUMPHREYS">험프리스</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <select
                      value={formData.status || 'DRAFT'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DRAFT">임시저장</option>
                      <option value="FOR_SALE">판매중</option>
                      <option value="RESERVED">예약중</option>
                      <option value="SOLD">판매완료</option>
                      <option value="HIDDEN">숨김</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{car.title}</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(car.status)}`}>
                    {getStatusLabel(car.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">연식</p>
                      <p className="font-medium">{car.year}년</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Gauge className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">주행거리</p>
                      <p className="font-medium">{formatMileage(car.mileage)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">연료</p>
                      <p className="font-medium">{getFuelLabel(car.fuel_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">변속기</p>
                      <p className="font-medium">{getTransmissionLabel(car.transmission)}</p>
                    </div>
                  </div>
                </div>
                {(car.exterior_color || car.interior_color) && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    {car.exterior_color && (
                      <div>
                        <p className="text-xs text-gray-500">외장색</p>
                        <p className="font-medium">{car.exterior_color}</p>
                      </div>
                    )}
                    {car.interior_color && (
                      <div>
                        <p className="text-xs text-gray-500">내장색</p>
                        <p className="font-medium">{car.interior_color}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center pt-4 border-t">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-medium">{getLocationLabel(car.location_type)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">가격 정보</h2>
            {isEditMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      판매가 *
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      원가
                    </label>
                    <input
                      type="number"
                      value={formData.original_price || ''}
                      onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_negotiable || false}
                    onChange={(e) => setFormData({ ...formData, is_negotiable: e.target.checked })}
                    className="mr-2"
                  />
                  가격 협상 가능
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-600">{formatPrice(car.price)}</p>
                {car.original_price && car.original_price > car.price && (
                  <p className="text-sm text-gray-500 line-through">{formatPrice(car.original_price)}</p>
                )}
                {car.is_negotiable && (
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    가격 협상 가능
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">옵션</h2>
            {isEditMode ? (
              <div className="space-y-4">
                {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                            selectedOptions.includes(option.id)
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(option.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOptions([...selectedOptions, option.id])
                              } else {
                                setSelectedOptions(selectedOptions.filter(id => id !== option.id))
                              }
                            }}
                            className="hidden"
                          />
                          {option.name_ko || option.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.length === 0 ? (
                  <p className="text-gray-500 text-sm">등록된 옵션이 없습니다.</p>
                ) : (
                  options.map((option) => (
                    <span
                      key={option.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {option.name_ko || option.name}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상세 설명</h2>
            {isEditMode ? (
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="차량에 대한 상세 설명을 입력하세요."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {car.description || '등록된 설명이 없습니다.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">통계</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">조회수</span>
                <span className="font-medium">{car.view_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">문의수</span>
                <span className="font-medium">{car.inquiry_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">등록일</span>
                <span className="font-medium">{formatDate(car.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">수정일</span>
                <span className="font-medium">{formatDate(car.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Inquiries Link */}
          <div className="bg-white shadow rounded-lg p-6">
            <Link
              href={`/admin/used-cars/inquiries?car_id=${carId}`}
              className="flex items-center justify-between text-blue-600 hover:text-blue-800"
            >
              <span className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                문의 목록 보기
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm">
                {car.inquiry_count}
              </span>
            </Link>
          </div>

          {/* Admin Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">관리자 메모</h2>
            {isEditMode ? (
              <textarea
                value={formData.admin_notes || ''}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="관리자 메모..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {car.admin_notes || '메모 없음'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CarDetailPage() {
  return (
    <Suspense fallback={<div className="bg-white shadow rounded-lg p-6"><div className="text-center">로딩 중...</div></div>}>
      <CarDetailContent />
    </Suspense>
  )
}