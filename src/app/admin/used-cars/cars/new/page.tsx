'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface CarForm {
  title: string
  make: string
  model: string
  trim: string
  year: number
  mileage: number
  fuel_type: string
  transmission: string
  body_type: string
  exterior_color: string
  interior_color: string
  engine_size: string
  horsepower: number | null
  drivetrain: string
  vin: string
  plate_number: string
  price: number
  original_price: number | null
  is_negotiable: boolean
  status: string
  location_type: string
  description: string
  accident_history: string
  previous_owners: number | null
  admin_notes: string
}

interface CarMake {
  id: string
  name: string
  name_ko: string | null
}

interface CarOption {
  id: string
  name: string
  name_ko: string | null
  category: string
}

export default function NewCarPage() {
  const router = useRouter()

  const [makes, setMakes] = useState<CarMake[]>([])
  const [allOptions, setAllOptions] = useState<CarOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CarForm>({
    title: '',
    make: '',
    model: '',
    trim: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuel_type: 'GASOLINE',
    transmission: 'AUTOMATIC',
    body_type: '',
    exterior_color: '',
    interior_color: '',
    engine_size: '',
    horsepower: null,
    drivetrain: '',
    vin: '',
    plate_number: '',
    price: 0,
    original_price: null,
    is_negotiable: false,
    status: 'DRAFT',
    location_type: 'PYEONGTAEK',
    description: '',
    accident_history: '',
    previous_owners: null,
    admin_notes: '',
  })

  const loadMakes = useCallback(async () => {
    const { data } = await supabase
      .from('car_makes')
      .select('id, name, name_ko')
      .eq('is_active', true)
      .order('display_order')
    setMakes(data || [])
  }, [])

  const loadOptions = useCallback(async () => {
    const { data } = await supabase
      .from('car_options')
      .select('*')
      .eq('is_active', true)
      .order('category, display_order')
    setAllOptions(data || [])
  }, [])

  useEffect(() => {
    loadMakes()
    loadOptions()
  }, [loadMakes, loadOptions])

  const handleSave = async () => {
    if (!formData.make || !formData.model) {
      alert('제조사와 모델은 필수입니다.')
      return
    }
    if (!formData.price) {
      alert('가격을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      // Generate title if empty
      const title = formData.title || `${formData.year} ${formData.make} ${formData.model}${formData.trim ? ' ' + formData.trim : ''}`

      const { data, error } = await supabase
        .from('used_cars')
        .insert({
          title: title,
          make: formData.make,
          model: formData.model,
          trim: formData.trim || null,
          year: formData.year,
          mileage: formData.mileage,
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          body_type: formData.body_type || null,
          exterior_color: formData.exterior_color || null,
          interior_color: formData.interior_color || null,
          engine_size: formData.engine_size || null,
          horsepower: formData.horsepower,
          drivetrain: formData.drivetrain || null,
          vin: formData.vin || null,
          plate_number: formData.plate_number || null,
          price: formData.price,
          original_price: formData.original_price,
          is_negotiable: formData.is_negotiable,
          status: formData.status,
          location_type: formData.location_type,
          description: formData.description || null,
          accident_history: formData.accident_history || null,
          previous_owners: formData.previous_owners,
          admin_notes: formData.admin_notes || null,
        })
        .select()
        .single()

      if (error) throw error

      // Add options
      if (selectedOptions.length > 0) {
        await supabase
          .from('car_option_mappings')
          .insert(selectedOptions.map(optionId => ({
            car_id: data.id,
            option_id: optionId,
          })))
      }

      alert('차량이 등록되었습니다.')
      router.push(`/admin/used-cars/cars/${data.id}`)
    } catch (error) {
      console.error('Error creating car:', error)
      alert('차량 등록에 실패했습니다.')
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">새 차량 등록</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/used-cars/cars"
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제조사 *
                  </label>
                  <select
                    value={formData.make}
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
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="소나타, 그랜저 등"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    트림
                  </label>
                  <input
                    type="text"
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="프리미엄, 익스클루시브 등"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  차량명 (자동 생성됨)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="비워두면 자동 생성됩니다"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연식 *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주행거리 (km) *
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연료
                  </label>
                  <select
                    value={formData.fuel_type}
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
                    value={formData.transmission}
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
                    value={formData.exterior_color}
                    onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="블랙, 화이트 등"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내장색
                  </label>
                  <input
                    type="text"
                    value={formData.interior_color}
                    onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="블랙, 베이지 등"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    지역
                  </label>
                  <select
                    value={formData.location_type}
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
                    value={formData.status}
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
          </div>

          {/* Price */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">가격 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    판매가 (원) *
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원가 (원)
                  </label>
                  <input
                    type="number"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_negotiable}
                  onChange={(e) => setFormData({ ...formData, is_negotiable: e.target.checked })}
                  className="mr-2"
                />
                가격 협상 가능
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">옵션</h2>
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
          </div>

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상세 설명</h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="차량에 대한 상세 설명을 입력하세요."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Additional Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">추가 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  차량번호
                </label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이전 소유자 수
                </label>
                <input
                  type="number"
                  value={formData.previous_owners || ''}
                  onChange={(e) => setFormData({ ...formData, previous_owners: parseInt(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Accident History */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">사고 이력</h2>
            <textarea
              value={formData.accident_history}
              onChange={(e) => setFormData({ ...formData, accident_history: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="사고 이력이 있다면 입력하세요."
            />
          </div>

          {/* Admin Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">관리자 메모</h2>
            <textarea
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="관리자 메모..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}